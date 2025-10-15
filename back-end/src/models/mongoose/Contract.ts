import mongoose, { Document } from "mongoose";
import { IContract } from "../Contract";
import { ContractStatus } from "@src/common/constants";
const PendingUpdateSchema = new mongoose.Schema(
  {
    new_end_date: { type: Date, required: false },
    signature: {
      tenant_signature: { type: Boolean, required: false },
      owner_signature: { type: Boolean, required: false },
    },
  },
  { _id: false }, // không cần _id riêng cho nested object
);

const ContractSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: String,
      required: true,
    },
    owner_id: {
      type: String,
      required: true,
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    pending_updates: {
      type: PendingUpdateSchema,
      required: false,
    },
    start_date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ContractStatus,
      default: ContractStatus.pending,
    },
    signature: {
      type: new mongoose.Schema(
        {
          tenant_signature: { type: Boolean, default: false },
          owner_signature: { type: Boolean, default: false },
        },
        { _id: false },
      ),
      required: false,
    },
    termination: {
      terminal_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      reason: { type: String, required: false },
      resolve_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      resolve_at: { type: Date, required: false },
    },
  },
  { timestamps: true, versionKey: false },
);

export type ContractDocument = Document & IContract;

export default mongoose.model<ContractDocument>("Contract", ContractSchema);
