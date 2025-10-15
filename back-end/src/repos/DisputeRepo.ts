/******************************************************************************
                                Functions
******************************************************************************/

import { ICreateDispute } from "@src/models/Dispute";
import Dispute, { DisputeDocument } from "@src/models/mongoose/Dispute";

async function createDispute(
  disputeData: ICreateDispute,
): Promise<DisputeDocument> {
  const disputeDoc = new Dispute({
    contract_id: disputeData.contract_id,
    disputer_id: disputeData.disputer_id,
    transaction_id: disputeData.transaction_id,
    reason: disputeData.reason,
    evidence: disputeData.evidence.map((url) => ({
      url,
    })),
  });
  const result = await disputeDoc.save();
  return result;
}

async function findByContractId(
  contractId: string,
): Promise<DisputeDocument[] | null> {
  return Dispute.find({
    contract_id: contractId,
  }).populate("transaction_id");
}
async function findByContractIds(
  contractIds: string[],
): Promise<DisputeDocument[]> {
  return Dispute.find({ contract_id: { $in: contractIds } });
}
async function findById(disputeId: string): Promise<DisputeDocument | null> {
  return Dispute.findById(disputeId)
    .populate("contract_id")
    .populate("disputer_id")
    .populate("transaction_id");
}

async function findByUserId(userId: string): Promise<DisputeDocument[] | null> {
  return Dispute.find({
    disputer_id: userId,
  })
    .populate("contract_id")
    .populate("transaction_id");
}

const getListDisputeSearch = async (
  page: number,
  limit: number,
  status?: string, // hoặc DisputeStatus nếu bạn có enum
): Promise<{ disputes: DisputeDocument[], total: number }> => {
  const filter: any = {};

  // Lọc theo trạng thái nếu có
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const disputes = await Dispute.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await Dispute.countDocuments(filter).exec();

  return { disputes, total };
};

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  createDispute,
  findByContractId,
  findById,
  findByUserId,
  getListDisputeSearch,
  findByContractIds,
} as const;
