import mongoose, { Document } from "mongoose";
import { IDispute } from "../Dispute";
import { DisputeResolution, DisputeStatus } from "@src/common/constants";

const EvidenceSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // URL to the evidence file
    uploaded_at: { type: Date, default: Date.now }, // Timestamp of when the evidence was uploaded
  },
  { _id: false }, // Disable automatic _id generation for this subdocument
);
const ResolutionSchema = new mongoose.Schema(
  {
    resolved_by: {
      type: String,
      required: false,
    },
    decision: {
      type: String,
      enum: DisputeResolution,
      required: false,
    },
    reason: {
      type: String,

      required: false,
    },
    resolved_at: {
      type: Date,
      required: false,
    },
  },
  { _id: false }, // không tạo _id riêng cho embedded object
);
const DisputeSchema = new mongoose.Schema(
  {
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    disputer_id: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    evidence: [EvidenceSchema],
    status: {
      type: String,
      default: DisputeStatus.pending,
    },
    resolution: ResolutionSchema,
  },
  { timestamps: true, versionKey: false },
);

export type DisputeDocument = Document & IDispute;

export default mongoose.model<DisputeDocument>("Dispute", DisputeSchema);
