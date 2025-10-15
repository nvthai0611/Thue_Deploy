/******************************************************************************
                                Constants
******************************************************************************/

import {
  ContractStatus,
  DisputeResolution,
  DisputeStatus,
} from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { ICreateDispute, ICreateDisputeReq } from "@src/models/Dispute";
import { DisputeDocument } from "@src/models/mongoose/Dispute";
import Room from "@src/models/mongoose/Room";
import ContractRepo from "@src/repos/ContractRepo";
import DisputeRepo from "@src/repos/DisputeRepo";
import TransactionRepo from "@src/repos/TransactionRepo";
import UserDetailRepo from "@src/repos/UserDetailRepo";
import UserRepo from "@src/repos/UserRepo";
import logger from "jet-logger";
import ContractService from "./ContractService";
import { sendContractResolvedMail } from "./email/emailService";
import { createRefundRequest } from "./zalo-pay/refund/create-refund";
import { queryRefundRequest } from "./zalo-pay/refund/query-refund";
import { getMRefundId } from "./zalo-pay/utils";

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Wait for refund to be successful by querying ZaloPay
 * @param m_refund_id Refund ID to query
 * @param maxAttempts Maximum number of attempts (default: 5)
 * @param delayMs Delay between attempts in milliseconds (default: 2000)
 * @returns Final refund query result
 */
async function waitForRefundSuccess(
  m_refund_id: string,
  maxAttempts = 5,
  delayMs = 2000,
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info(
      `Querying refund status - Attempt ${attempt}/${maxAttempts} for ${m_refund_id}`,
    );

    const refundResult = await queryRefundRequest({
      m_refund_id,
      timestamp: Date.now(),
    });

    logger.info(
      `Refund query result for ${m_refund_id}: ${JSON.stringify(refundResult)}`,
    );

    if (refundResult.return_code === 1) {
      logger.info(`Refund successful for ${m_refund_id} on attempt ${attempt}`);
      return refundResult;
    }

    if (attempt < maxAttempts) {
      logger.info(
        `Refund not yet successful for ${m_refund_id}, waiting ${delayMs}ms before next attempt...`,
      );
      // If not successful, wait before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } else {
      // If all attempts fail, return the final result
      logger.err(
        `All ${maxAttempts} attempts failed for refund ${m_refund_id}`,
      );
      return refundResult;
    }
  }
}

const createDispute = async (
  disputeData: ICreateDisputeReq,
  userId: string,
): Promise<DisputeDocument> => {
  // Validate the disputeData here if necessary
  const contract = await ContractRepo.findContractById(disputeData.contract_id);
  if (!contract) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Invalid contract ID provided for dispute creation.",
    );
  }
  if (contract.tenant_id !== userId && contract.owner_id !== userId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not authorized to create a dispute for this contract.",
    );
  }
  if (contract.status !== ContractStatus.active) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Cannot create a dispute for a contract that is not active.",
    );
  }
  const transaction = await TransactionRepo.getTransactionWhereContractId(
    disputeData.contract_id,
  );
  if (!transaction) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "No transaction found for the provided contract ID.",
    );
  }
  const existingDisputes = await DisputeRepo.findByContractId(
    disputeData.contract_id,
  );
  if (existingDisputes && existingDisputes.length > 0) {
    const hasUnresolved = existingDisputes.some(
      (d) =>
        d.status !== DisputeStatus.resolved &&
        d.status !== DisputeStatus.rejected,
    );
    if (hasUnresolved) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "A dispute for this contract is already in progress.",
      );
    }
  }
  const disputeDataWithUser: ICreateDispute = {
    contract_id: disputeData.contract_id,
    disputer_id: userId,
    transaction_id: String(transaction._id),
    reason: disputeData.reason,
    evidence: disputeData.evidence || [],
  };

  const dispute = DisputeRepo.createDispute(disputeDataWithUser);
  return dispute;
};

const getDisputeByContractId = async (contractId: string): Promise<any[]> => {
  const disputes = await DisputeRepo.findByContractId(contractId);

  const disputesWithUser = await Promise.all(
    (disputes ?? []).map(async (dispute) => {
      const user = await UserRepo.getUserById(dispute.disputer_id);
      const userDetail = await UserDetailRepo.getUserDetailById(
        dispute.disputer_id,
      );

      const disputer_info = {
        full_name: user?.name ?? null,
        email: user?.email ?? null,
        avatar: userDetail?.avatar_url ?? null,
      };

      return {
        ...(dispute.toObject?.() ?? dispute),
        disputer_info,
      };
    }),
  );

  return disputesWithUser;
};
const getDisputeDetail = async (
  disputeId: string,
): Promise<DisputeDocument | null> => {
  const dispute = await DisputeRepo.findById(disputeId);
  if (!dispute) {
    return null;
  }
  const user = await UserRepo.getUserById(dispute.disputer_id);
  const userDetail = await UserDetailRepo.getUserDetailById(
    dispute.disputer_id,
  );

  const disputer_info = {
    full_name: user?.name ?? null,
    email: user?.email ?? null,
    avatar: userDetail?.avatar_url ?? null,
  };
  return {
    ...(dispute.toObject?.() ?? dispute),
    disputer_info,
  };
};

const getListDisputeSearch = async (
  page = 1,
  limit = 10,
  status: DisputeStatus = DisputeStatus.pending,
): Promise<{
  disputes: any[],
  total: number,
  totalPages: number,
  page: number,
}> => {
  const { disputes, total } = await DisputeRepo.getListDisputeSearch(
    page,
    limit,
    status,
  );

  interface DisputerInfo {
    full_name: string | null;
    email: string | null;
    avatar: string | null;
  }

  interface DisputeWithUser extends Record<string, any> {
    disputer_info: DisputerInfo;
  }

  const disputesWithUser: DisputeWithUser[] = await Promise.all(
    (disputes ?? []).map(async (dispute: any): Promise<DisputeWithUser> => {
      const user = await UserRepo.getUserById(dispute.disputer_id);
      const userDetail = await UserDetailRepo.getUserDetailById(
        dispute.disputer_id,
      );
      const disputer_info: DisputerInfo = {
        full_name: user?.name ?? null,
        email: user?.email ?? null,
        avatar: userDetail?.avatar_url ?? null,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const plainDispute = dispute.toObject?.() ?? dispute;
      return {
        ...plainDispute,
        disputer_info,
      };
    }),
  );

  const totalPages = Math.ceil(total / limit);

  return {
    disputes: disputesWithUser,
    total,
    totalPages,
    page,
  };
};

const adminHandleDisputeDecision = async (
  disputeId: string,
  reason: string,
  userId: string,
  decision: DisputeResolution,
): Promise<void> => {
  const dispute = await DisputeRepo.findById(disputeId);
  if (!dispute) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Dispute not found.");
  }

  const contract = await ContractRepo.findContractById(dispute.contract_id);
  if (!contract) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Contract not found for the dispute.",
    );
  }

  if (contract.status !== ContractStatus.active) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Cannot resolve dispute for a contract that is not active.",
    );
  }

  if (dispute.status !== DisputeStatus.pending) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Dispute is not in a pending state.",
    );
  }

  const resolver = await UserRepo.getUserById(userId);
  if (!resolver) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Resolver user not found.");
  }

  if (decision === DisputeResolution.rejected) {
    dispute.status = DisputeStatus.rejected;
    dispute.resolution = {
      resolved_by: resolver.id,
      decision,
      reason,
      resolved_at: new Date(),
    };
    const savedDispute = await dispute.save();
    if (!savedDispute) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to update dispute resolution.",
      );
    }
  } else {
    // Các quyết định khác như "disputer_wins"
    dispute.status = DisputeStatus.resolved;
    dispute.resolution = {
      resolved_by: resolver.id,
      decision,
      reason,
      resolved_at: new Date(),
    };
    await ContractService.updateContractDisputed(dispute.contract_id);
    const savedDispute = await dispute.save();
    if (!savedDispute) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to update dispute resolution.",
      );
    }
  }
  const tenant = await UserRepo.getUserById(contract.tenant_id);
  const landlord = await UserRepo.getUserById(contract.owner_id);
  const room = await Room.findById(contract.room_id).populate(
    "housing_area_id",
  );
  const housingArea = room?.housing_area_id as { name?: string } | null;

  // Handle refund here
  if (decision === DisputeResolution.disputer_wins) {
    logger.info(
      `Processing dispute resolution for contract ${dispute.contract_id} ` +
        `with decision: ${decision}`,
    );
    logger.info(
      `Tenant ID: ${tenant?.auth_user_id}, ` +
        `Landlord ID: ${landlord?.auth_user_id}, Dispute ID: ${disputeId}`,
    );
    logger.info(`Disputer ID: ${dispute.disputer_id}`);

    if (tenant?.auth_user_id === dispute.disputer_id) {
      // Refund for tenant - they win the dispute
      logger.info(
        `Tenant wins dispute - processing refund for tenant ${tenant.auth_user_id}`,
      );
      try {
        const transaction = await TransactionRepo.getTransactionWhereContractId(
          dispute.contract_id,
        );
        logger.info(
          `Transaction found for dispute resolution: ${JSON.stringify(
            transaction,
          )}`,
        );
        if (
          transaction &&
          transaction.zalo_payment?.zp_trans_id &&
          transaction.zalo_payment?.amount
        ) {
          const app_id = Number(process.env.ZALO_PAY_APP_ID);
          const refundId = getMRefundId(app_id);
          const transactionIdStr = transaction._id
            ? (transaction._id as { toString(): string }).toString()
            : "unknown";

          logger.info(
            `Creating refund request - ID: ${refundId}, ` +
              `ZP Trans ID: ${transaction.zalo_payment.zp_trans_id}, ` +
              `Amount: ${transaction.zalo_payment.amount}`,
          );

          const refundResponse = await createRefundRequest({
            m_refund_id: refundId,
            zp_trans_id: String(transaction.zalo_payment.zp_trans_id),
            amount: transaction.zalo_payment.amount,
            description: "Dispute refund",
            timestamp: Date.now(),
          });

          logger.info(
            `Refund response for transaction ${transactionIdStr}: ${JSON.stringify(
              refundResponse,
            )}`,
          );

          if (refundResponse.return_code === 1) {
            // Refund immediately successful
            logger.info(
              `Refund immediately successful for transaction ${transactionIdStr} ` +
                `with ID ${refundId}`,
            );
            await TransactionRepo.updateTransactionRefunds(transactionIdStr, {
              m_refund_id: refundId,
              refund_amount: transaction.zalo_payment.amount,
              refund_status: "success",
            });
            logger.info(`Refund successful for tenant: ${refundId}`);
          } else if (refundResponse.return_code === 3) {
            // Refund is in progress, need to query status
            logger.info(
              `Refund in progress for transaction ${transactionIdStr} ` +
                `with ID ${refundId}, querying status...`,
            );

            try {
              const finalRefundResult = await waitForRefundSuccess(
                refundId,
                5,
                2000,
              );

              if (finalRefundResult && finalRefundResult.return_code === 1) {
                logger.info(`Refund finally successful for ${refundId}`);
                await TransactionRepo.updateTransactionRefunds(
                  transactionIdStr,
                  {
                    m_refund_id: refundId,
                    refund_amount: transaction.zalo_payment.amount,
                    refund_status: "success",
                  },
                );
                logger.info(
                  `Refund successful for tenant after polling: ${refundId}`,
                );
              } else {
                const errorCode = finalRefundResult?.return_code ?? "N/A";
                const errorMessage =
                  finalRefundResult?.return_message ?? "Unknown error";
                logger.err(
                  `Refund failed after polling - Final Code: ${errorCode}, ` +
                    `Message: ${errorMessage}`,
                );
                await TransactionRepo.updateTransactionRefunds(
                  transactionIdStr,
                  {
                    m_refund_id: refundId,
                    refund_amount: 0,
                    refund_status: "failed",
                  },
                );
              }
            } catch (pollingError) {
              const errorMsg =
                pollingError instanceof Error
                  ? pollingError.message
                  : String(pollingError);
              logger.err(
                `Error during refund status polling for ${refundId}: ${errorMsg}`,
              );
              await TransactionRepo.updateTransactionRefunds(transactionIdStr, {
                m_refund_id: refundId,
                refund_amount: 0,
                refund_status: "failed",
              });
            }
          } else {
            // Refund failed immediately
            const errorCode = refundResponse.return_code;
            const errorMessage =
              refundResponse.return_message ?? "Unknown error";
            const subCode = refundResponse.sub_return_code ?? "N/A";
            const subMessage = refundResponse.sub_return_message ?? "N/A";

            logger.err(
              `Refund failed - Code: ${errorCode}, Message: ${errorMessage}, ` +
                `Sub Code: ${subCode}, Sub Message: ${subMessage}`,
            );

            // Update transaction with failed refund status
            await TransactionRepo.updateTransactionRefunds(transactionIdStr, {
              m_refund_id: refundId,
              refund_amount: 0,
              refund_status: "failed",
            });

            // Log but don't throw error to continue with dispute resolution
            logger.err(
              `Refund request failed but dispute resolution will continue. Refund ID: ${refundId}`,
            );
          }
        } else {
          const transactionId = transaction?._id
            ? (transaction._id as { toString(): string }).toString()
            : "N/A";
          const zpTransId = String(
            transaction?.zalo_payment?.zp_trans_id ?? "N/A",
          );
          const amount = String(transaction?.zalo_payment?.amount ?? "N/A");

          logger.err(
            `Invalid transaction data for refund - ` +
              `Transaction ID: ${transactionId}, ` +
              `ZP Trans ID: ${zpTransId}, Amount: ${amount}`,
          );
        }
      } catch (error) {
        logger.err("Error processing tenant refund:", error);
        // Don't throw error here to avoid blocking the dispute resolution process
        // Log the error and continue with email notification
      }
    } else if (landlord?.auth_user_id === dispute.disputer_id) {
      // Landlord wins dispute - they get to keep the deposit, no refund needed
      logger.info(
        `Landlord wins dispute - no refund processed, landlord keeps deposit`,
      );
    } else {
      logger.err(
        `Disputer ID ${dispute.disputer_id} does not match ` +
          `tenant ${tenant?.auth_user_id} or landlord ${landlord?.auth_user_id}`,
      );
    }
  } else {
    // Other decisions like rejected - no refund needed
    logger.info(`Dispute ${decision} - no refund processing required`);
  }

  await sendContractResolvedMail(
    tenant?.email ?? "",
    landlord?.email ?? "",
    tenant?.name ?? "",
    landlord?.name ?? "",
    room?.room_number ?? "",
    housingArea?.name ?? "",
    resolver?.name ?? "",
    decision,
    reason,
  );
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  createDispute,
  getDisputeByContractId,
  getDisputeDetail,
  getListDisputeSearch,
  adminHandleDisputeDecision,
} as const;
