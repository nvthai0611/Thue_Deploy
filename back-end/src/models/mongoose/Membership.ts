import mongoose, { Document } from "mongoose";
import { IMembership } from "../Membership";

const MembershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    duration_months: { type: Number, required: true },
    total_price: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

export type MembershipDocument = IMembership & Document;
export default mongoose.model<MembershipDocument>(
  "Membership",
  MembershipSchema,
);
