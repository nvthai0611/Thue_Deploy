/******************************************************************************
                                Constants
******************************************************************************/

import { ContractStatus, RoomStatus } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { getUserIdFromRequest } from "@src/common/util/authorization";
import { RouteError } from "@src/common/util/route-errors";
import { CreateContractRepo, IContract } from "@src/models/Contract";
import { TransactionDocument } from "@src/models/mongoose/Transaction";
import ContractRepo from "@src/repos/ContractRepo";
import RoomRepo from "@src/repos/RoomRepo";
import TransactionRepo from "@src/repos/TransactionRepo";
import { IReq } from "@src/routes/common/types";
import logger from "jet-logger";
import { createRefundRequest } from "./zalo-pay/refund/create-refund";
import { queryRefundRequest } from "./zalo-pay/refund/query-refund";
import { getMRefundId } from "./zalo-pay/utils";
/******************************************************************************
                                Functions
******************************************************************************/

const addContractByTenant = async (
  roomId: string,
  end_date: Date,
  req: IReq,
): Promise<IContract> => {
  const getTenantId = getUserIdFromRequest(req);
  const getRoomPopulateHousingeArea = await RoomRepo.getHousingAreaByRoomId(
    roomId,
  );
  if (!getRoomPopulateHousingeArea) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Room not found or does not exist",
    );
  }
  if (getRoomPopulateHousingeArea.status !== RoomStatus.available) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is not available for contract creation",
    );
  }
  //get owner_id from room
  const getOwnerId = getRoomPopulateHousingeArea?.housing_area_id.owner_id;
  if (!getTenantId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Tenant ID is required");
  }
  // const isUserValid = await UserDetailRepo.findOneUserDetail(getTenantId);
  // if (!isUserValid) {
  //   throw new RouteError(HttpStatusCodes.NOT_FOUND, "User not found");
  // }
  //  if (!isUserValid.verified) {
  //   throw new RouteError(HttpStatusCodes.FORBIDDEN, "User is not verified");
  // }
  if (!(end_date instanceof Date) || end_date <= new Date()) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "End date must be in the future",
    );
  }
  if (!getOwnerId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Owner ID is required");
  }
  if (getTenantId === getOwnerId) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Owner cannot be tenant");
  }
  const newContract: CreateContractRepo = {
    tenant_id: getTenantId,
    owner_id: getOwnerId,
    room_id: roomId,
    end_date: end_date,
  };
  // Save the contract using the repository
  return await ContractRepo.addContract(newContract);
};

const getContractByTenant = async (req: IReq): Promise<IContract[]> => {
  const getTenantId = getUserIdFromRequest(req);
  if (!getTenantId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Tenant ID is required");
  }
  const contracts = await ContractRepo.getContractsByTenantId(getTenantId);
  // Ensure each contract matches IContract type
  return contracts.map((contract: any) => ({
    tenant_id: contract.tenant_id,
    owner_id: contract.owner_id,
    room_id: contract.room_id,
    start_date: contract.start_date,
    end_date: contract.end_date,
    status: contract.status,
    signature: contract.signature,
    pending_updates: contract.pending_updates,
    isDispute: contract.isDispute ?? false,
    ...contract,
  })) as IContract[];
};

const getContractByOwner = async (req: IReq): Promise<IContract[]> => {
  const getOwnerId = getUserIdFromRequest(req);
  if (!getOwnerId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Owner ID is required");
  }
  const contracts = await ContractRepo.getContractsByOwnerId(getOwnerId);
  // Ensure each contract matches IContract type
  return contracts.map((contract: any) => ({
    tenant_id: contract.tenant_id,
    owner_id: contract.owner_id,
    room_id: contract.room_id,
    start_date: contract.start_date,
    end_date: contract.end_date,
    status: contract.status,
    signature: contract.signature,
    pending_updates: contract.pending_updates,
    isDispute: contract.isDispute ?? false,
    ...contract,
  })) as IContract[];
};

const getContractStatisticsByOwner = async (req: IReq): Promise<any> => {
  const getOwnerId = getUserIdFromRequest(req);
  if (!getOwnerId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Owner ID is required");
  }
  
  const statistics = await ContractRepo.getContractStatisticsByOwnerId(getOwnerId);
  return statistics;
};

const SignByLandlord = async (
  contractId: string,
  req: IReq,
): Promise<IContract> => {
  const getOwnerId = getUserIdFromRequest(req);
  if (!getOwnerId) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Owner ID is required");
  }
  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.status !== ContractStatus.pending) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract is not in pending status",
    );
  }
  if (contract.signature?.owner_signature) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract already signed by landlord",
    );
  }
  if (contract.owner_id !== getOwnerId) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not authorized to sign this contract",
    );
  }
  if (contract.signature) {
    contract.signature.owner_signature = true;
  }
  return await contract.save();
};

const updateDepositStatus = async (contractId: string): Promise<IContract> => {
  const contract = await ContractRepo.findContractById(contractId);

  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.status !== ContractStatus.pending) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract is not in pending status",
    );
  }
  if (contract.end_date <= new Date()) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract end date must be in the future",
    );
  }
  if (
    contract.signature?.tenant_signature !== true &&
    contract.signature?.owner_signature !== true
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Both tenant and landlord must sign the contract before updating deposit status",
    );
  }

  const getRoom = await RoomRepo.findById(contract.room_id);
  if (!getRoom) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (getRoom.status !== RoomStatus.available) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is not available for contract signing",
    );
  }
  await RoomRepo.update(getRoom._id as string, {
    status: RoomStatus.occupied,
  });

  const updatedContract = await ContractRepo.updateDeposit(contractId);
  if (!updatedContract) {
    throw new RouteError(
      HttpStatusCodes.NOT_FOUND,
      "Contract not found after updating deposit",
    );
  }
  await ContractRepo.deleteAllContrctsByRoomId(
    updatedContract.room_id.toString(),
  );
  return updatedContract;
};

const getContractById = async (contractId: string): Promise<IContract> => {
  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  return contract;
};

const requestExtensionContract = async (
  contractId: string,
  newEndDate: Date,
  userId: string,
): Promise<IContract> => {
  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.pending_updates) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "There is already a pending extension request for this contract",
    );
  }

  if (contract.status !== ContractStatus.active) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract is not active for extension",
    );
  }

  if (!(newEndDate instanceof Date) || newEndDate <= new Date()) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "New end date must be in the future",
    );
  }

  if (newEndDate <= contract.end_date) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "New end date must be after current end date",
    );
  }

  // Determine who is signing (tenant or owner)
  const isTenant = userId === contract.tenant_id;
  const isOwner = userId === contract.owner_id;

  if (!isTenant && !isOwner) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "Only the tenant or owner can request an extension",
    );
  }

  // Set pending_updates with the new date and auto-sign the requester
  contract.pending_updates = {
    new_end_date: newEndDate,
    signature: {
      tenant_signature: isTenant,
      owner_signature: isOwner,
    },
  };

  return await contract.save();
};

const confirmExtensionContract = async (
  contractId: string,
  req: IReq,
): Promise<IContract> => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    throw new RouteError(
      HttpStatusCodes.UNAUTHORIZED,
      "User not authenticated",
    );
  }

  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.status !== ContractStatus.active) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Contract is not in pending status",
    );
  }
  if (
    !contract.pending_updates?.new_end_date ||
    !contract.pending_updates.signature
  ) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "No pending extension request to confirm",
    );
  }
  // Confirm who is signing (tenant or owner)
  const isTenant = userId === contract.tenant_id;
  const isOwner = userId === contract.owner_id;
  if (!isTenant && !isOwner) {
    throw new RouteError(
      HttpStatusCodes.FORBIDDEN,
      "You are not authorized to confirm this contract",
    );
  }
  if (isTenant) {
    contract.pending_updates.signature.tenant_signature = true;
  } else if (isOwner) {
    contract.pending_updates.signature.owner_signature = true;
  }

  return await contract.save();
};

const isContractPendingLegit = (contract: IContract): boolean => {
  if (!contract.pending_updates) {
    return false;
  }
  if (contract.status !== ContractStatus.active) {
    return false;
  }
  const { new_end_date, signature } = contract.pending_updates;
  if (
    !new_end_date ||
    !(new_end_date instanceof Date) ||
    new_end_date <= new Date()
  ) {
    return false;
  }
  if (!signature || !signature.tenant_signature || !signature.owner_signature) {
    return false;
  }
  return true;
};

async function waitForRefundSuccess(
  m_refund_id: string,
  maxAttempts = 5,
  delayMs = 2000,
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const refundResult = await queryRefundRequest({
      m_refund_id,
      timestamp: Date.now(),
    });

    if (refundResult.return_code === 1) {
      return refundResult;
    }

    if (attempt < maxAttempts) {
      // If not successful, wait before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } else {
      // If all attempts fail, return the final result
      return refundResult;
    }
  }
}

const refundDeposit = async (
  transaction: TransactionDocument,
): Promise<void> => {
  const app_id = transaction.zalo_payment?.app_id;

  if (typeof app_id === "undefined") {
    throw new Error("app_id is required for refund");
  }

  const m_refund_id = getMRefundId(app_id);
  const zp_trans_id_num = transaction.zalo_payment?.zp_trans_id;

  if (typeof zp_trans_id_num === "undefined") {
    throw new Error("zp_trans_id is required for refund");
  }

  const zp_trans_id = String(zp_trans_id_num);
  const amount = transaction.zalo_payment?.amount;

  if (typeof amount === "undefined") {
    throw new Error("amount is required for refund");
  }

  const description = `Deposit refund for contract ${transaction.contract_id}`;
  const payload = {
    m_refund_id,
    zp_trans_id,
    amount,
    description,
    timestamp: Date.now(),
  };
  await createRefundRequest(payload);

  const refundResult = await waitForRefundSuccess(m_refund_id, 5, 2000);

  logger.info(
    `Refund result for m_refund_id ${m_refund_id}: ${JSON.stringify(
      refundResult,
    )}`,
  );

  if (refundResult && refundResult.return_code === 1) {
    logger.info(`Refund for m_refund_id ${m_refund_id} was successful.`);
    await TransactionRepo.updateTransactionRefunds(transaction.id, {
      m_refund_id,
      refund_amount: amount,
      refund_status: "success",
    });
  }
};

const updateContractExpired = async (
  contractId: string,
): Promise<IContract> => {
  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.status !== ContractStatus.active) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Contract is not active");
  }
  const room = await RoomRepo.findById(contract.room_id);
  if (!room) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (room.status !== RoomStatus.occupied) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is not occupied, cannot update contract status",
    );
  }
  // Update room status to available
  await RoomRepo.update(room._id as string, {
    status: RoomStatus.available,
  });
  contract.status = ContractStatus.expired;

  return await contract.save();
};

const updateContractDisputed = async (
  contractId: string,
): Promise<IContract> => {
  const contract = await ContractRepo.findContractById(contractId);
  if (!contract) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
  }
  if (contract.status !== ContractStatus.active) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, "Contract is not active");
  }
  const room = await RoomRepo.findById(contract.room_id);
  if (!room) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, "Room not found");
  }
  if (room.status !== RoomStatus.occupied) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Room is not occupied, cannot update contract status",
    );
  }
  contract.status = ContractStatus.terminated;
  await RoomRepo.update(room._id as string, {
    status: RoomStatus.available,
  });

  return await contract.save();
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addContractByTenant,
  getContractByTenant,
  getContractByOwner,
  getContractStatisticsByOwner,
  SignByLandlord,
  updateDepositStatus,
  getContractById,
  requestExtensionContract,
  confirmExtensionContract,
  isContractPendingLegit,
  refundDeposit,
  updateContractExpired,
  updateContractDisputed,
} as const;
