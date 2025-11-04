import Transaction, {
  TransactionDocument,
} from "@src/models/mongoose/Transaction";
import { ITransaction } from "@src/models/Transaction";

/******************************************************************************
                                Functions
******************************************************************************/
const addTransaction = (
  transaction: ITransaction,
): Promise<TransactionDocument> => {
  const newTransaction = new Transaction(transaction);
  return newTransaction.save();
};

/**
 * Update only zalo_payment.refunds for a transaction, keeping other data unchanged.
 */
async function updateTransactionRefunds(
  transactionId: string,
  refunds: { m_refund_id: string, refund_amount: number, refund_status: string },
): Promise<TransactionDocument | null> {
  return Transaction.findByIdAndUpdate(
    transactionId,
    { $set: { "zalo_payment.refunds": refunds } },
    { new: true },
  );
}

async function findByContractId(
  contractId: string,
): Promise<TransactionDocument | null> {
  return Transaction.findOne({ contract_id: contractId });
}

async function getTransaction(
  userId: string,
  page: number,
  limit: number,
): Promise<{ data: TransactionDocument[], total: number, totalPages: number }> {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Transaction.find({ user_id: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Transaction.countDocuments({ user_id: userId }),
  ]);
  return { data, total, totalPages: Math.ceil(total / limit) };
}

async function getTransactionWhereContractId(
  contractId: string,
): Promise<TransactionDocument | null> {
  return Transaction.findOne({ contract_id: contractId }).sort({
    createdAt: -1,
  });
}

async function getAllTransaction(): Promise<any> {
  const transactions = await Transaction.find().populate({
    path: "contract_id",
    populate: {
      path: "room_id",
    },
  });
  return transactions;

}
/******************************************************************************
                                Export default
******************************************************************************/

export default {
  addTransaction,
  findByContractId,
  updateTransactionRefunds,
  getTransaction,
  getTransactionWhereContractId,
  getAllTransaction,
} as const;
