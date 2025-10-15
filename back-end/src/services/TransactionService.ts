import { TransactionType } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { TransactionDocument } from "@src/models/mongoose/Transaction";
import { ICreateTransactionReq } from "@src/models/Transaction";
import ContractRepo from "@src/repos/ContractRepo";
import TransactionRepo from "@src/repos/TransactionRepo";

/******************************************************************************
                                Constants
******************************************************************************/
/******************************************************************************
                                Functions
******************************************************************************/
const addTransaction = async (
  data: ICreateTransactionReq,
): Promise<TransactionDocument> => {
  const { type, contract_id, user_id } = data;
  if (!user_id) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "User ID is required for deposit transactions",
    );
  }
  if (type === TransactionType.deposit) {
    if (!contract_id) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        "Contract ID is required for deposit transactions",
      );
    }
    const contract = await ContractRepo.findContractById(contract_id);
    if (!contract) {
      throw new RouteError(HttpStatusCodes.NOT_FOUND, "Contract not found");
    }
    if (contract.tenant_id !== user_id) {
      throw new RouteError(
        HttpStatusCodes.FORBIDDEN,
        "You are not the owner of this contract",
      );
    }
  }
  if (!data.zalo_payment) {
    throw new RouteError(
      HttpStatusCodes.BAD_REQUEST,
      "Zalo payment details are required for service transactions",
    );
  }
  return TransactionRepo.addTransaction({
    ...data,
  });
};



const getTransaction = async (userId: string, page: number, limit: number) => {
  return TransactionRepo.getTransaction(userId, page, limit);
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addTransaction,
  getTransaction,
} as const;
