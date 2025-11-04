import { TransactionType } from "@src/common/constants";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";
import { RouteError } from "@src/common/util/route-errors";
import { TransactionDocument } from "@src/models/mongoose/Transaction";
import { ICreateTransactionReq } from "@src/models/Transaction";
import ContractRepo from "@src/repos/ContractRepo";
import TransactionRepo from "@src/repos/TransactionRepo";
import UserService from "@src/services/UserService";

interface PopulatedTransaction {
  _id: string | { toString: () => string };
  user_id?: string | null;
  [key: string]: unknown;
}

interface HasToObject {
  toObject: (options?: { virtuals?: boolean }) => Record<string, unknown>;
}

interface HasConvertibleObjectId {
  _id: { toString: () => string } | string;
}

const hasToObject = (value: unknown): value is HasToObject => {
  return (
    typeof value === "object" &&
    value !== null &&
    "toObject" in value &&
    typeof (value as { toObject?: unknown }).toObject === "function"
  );
};

const hasConvertibleObjectId = (
  value: unknown,
): value is HasConvertibleObjectId => {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value._id !== undefined &&
    value._id !== null &&
    (typeof value._id === "string" ||
      (typeof value._id === "object" &&
        value._id !== null &&
        "toString" in value._id &&
        typeof (value._id as { toString?: unknown }).toString === "function"))
  );
};

const ensureStringId = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }

  if (
    typeof value === "object" &&
    "toString" in value &&
    typeof (value as { toString?: unknown }).toString === "function"
  ) {
    const serialized = (value as { toString: () => string }).toString();
    if (serialized !== "[object Object]") {
      return serialized;
    }
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};


const normalizeTransactionItem = (
  transaction: unknown,
): PopulatedTransaction => {
  if (hasToObject(transaction)) {
    const plain = transaction.toObject({ virtuals: true });
    const normalizedId = ensureStringId((plain as { _id?: unknown })._id);
    const normalized = {
      ...plain,
      _id: normalizedId,
    } satisfies PopulatedTransaction;
    return normalized;
  }

  if (hasConvertibleObjectId(transaction)) {
    const normalized = {
      ...(transaction as unknown as Record<string, unknown>),
      _id: ensureStringId(transaction._id),
    } satisfies PopulatedTransaction;
    return normalized;
  }

  if (transaction && typeof transaction === "object") {
    return transaction as PopulatedTransaction;
  }

  return {} as PopulatedTransaction;
};

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
const getAllTransaction = async () => {
  const rawTransactions = await TransactionRepo.getAllTransaction();

  // eslint-disable-next-line
  const transactions: PopulatedTransaction[] = rawTransactions.map(
    normalizeTransactionItem,
  );

  const userIds = Array.from(
    new Set(
      transactions
        .map((transaction: PopulatedTransaction) => transaction?.user_id)
        .filter(
          (userId: PopulatedTransaction["user_id"]): userId is string =>
            typeof userId === "string" && userId.trim().length > 0,
        ),
    ),
  );

  const userMap = new Map<string, unknown>();

  if (userIds.length > 0) {
    const results = await Promise.allSettled(
      userIds.map(async (userId: string) => {
        const user = await UserService.getUserById(userId);
        return { userId, user };
      }),
    );

    results.forEach((result, index) => {
      const userId = userIds[index];
      if (result.status === "fulfilled") {
        userMap.set(result.value.userId, result.value.user);
      } else {

        userMap.set(userId, null);
      }
    });
  }

  return transactions.map((transaction: PopulatedTransaction) => ({
    ...transaction,
    user: transaction?.user_id
      ? userMap.get(transaction.user_id) ?? null
      : null,
  }));
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addTransaction,
  getTransaction,
  getAllTransaction,
} as const;
