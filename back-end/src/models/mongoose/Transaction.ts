import { TransactionType } from "@src/common/constants";
import mongoose, { Document, Schema } from "mongoose";
import { ITransaction } from "../Transaction";

const refundSchema = new mongoose.Schema(
  {
    m_refund_id: { type: String, required: true },
    zp_refund_id: { type: Number },
    refund_amount: { type: Number, required: true },
    refund_fee_amount: { type: Number },
    refund_description: { type: String },
    refund_status: { type: String },
    refund_return_code: { type: Number },
    refund_return_message: { type: String },
    refund_sub_return_code: { type: Number },
    refund_sub_return_message: { type: String },
  },
  {
    _id: false,
    timestamps: {
      createdAt: "refund_created_at",
      updatedAt: "refund_updated_at",
    },
  },
);
const ZaloSchema = new mongoose.Schema(
  {
    app_id: { type: Number, required: true },
    app_trans_id: { type: String, required: true, unique: true },
    app_time: { type: Number, required: true },
    app_user: { type: String, required: true },
    amount: { type: Number, required: true },
    embed_data: { type: Schema.Types.Mixed },
    item: { type: Schema.Types.Mixed },
    zp_trans_id: { type: Number },
    server_time: { type: Number },
    channel: { type: Number },
    merchant_user_id: { type: String },
    user_fee_amount: { type: Number },
    discount_amount: { type: Number },
    status: { type: Number , default: 2},
    callback_received: { type: Boolean, default: false },
    error_message: { type: String },
    refunds: {
      type: refundSchema,
      default: null,
    },
  },
  { _id: false, timestamps: true },
);
const TransactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: false,
      default: null,
    },
    housing_area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingArea",
      required: false,
      default: null,
    },
    room_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: TransactionType,
      required: true,
    },
    zalo_payment: {
      type: ZaloSchema,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: false, versionKey: false },
);

export type TransactionDocument = Document & ITransaction;

export default mongoose.model<TransactionDocument>(
  "Transaction",
  TransactionSchema,
);
