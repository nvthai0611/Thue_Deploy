import mongoose, { Document } from "mongoose";
import { IUserDetail } from "../UserDetail";

// Định nghĩa schema cho từng activity
const MemberCardActivitySchema = new mongoose.Schema(
  {
    membership_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
  },
  { _id: false },
);

const PropertyDocumentSchema = new mongoose.Schema(
  {
    verified_by: {
      type: String,
      required: true,
    },
    type: { type: String, required: true },
    description: { type: String, required: true },
    image: [
      {
        url: { type: String, required: true },
        type: { type: String, required: true },
        uploaded_at: { type: String, required: true },
      },
    ],
    reason: { type: String, default: "" },
    status: { type: String, required: true, default: "pending" },
    uploaded_at: { type: Date, default: Date.now },
    verified_at: { type: Date },
  },
  { _id: false },
);

const UserDetailSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    avatar_url: { type: String, default: "" },
    identity_card: {
      id_number: { type: String, required: false },
      full_name: { type: String, required: false },
      gender: { type: String, required: false },
      date_of_birth: { type: Date, required: false },
      nationality: { type: String, required: false },
      issue_date: { type: Date, required: false },
      expiry_date: { type: Date, required: false },
      place_of_origin: { type: String, required: false },
      place_of_residence: { type: String, required: false },
      personal_identification_number: { type: String, required: false },
      photo_url: { type: String, required: false },
      issued_by: { type: String, required: false },
      card_type: { type: String, default: "" },
    },
    membership_activity: {
      type: [MemberCardActivitySchema],
      default: [],
    },
    property_document: {
      type: PropertyDocumentSchema,
      default: null,
    },
    bank_account: {
      bank_name: { type: String, required: false },
      account_number: { type: String, required: false },
      status: { type: String, required: false },
      verified_at: { type: Date },
    },
    status: {
      type: String,
    },
    chat_with: { type: [String], default: [] },
    saved_rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        default: [],
      },
    ],
    verified: { type: Boolean, default: false },
    hasPostedBefore: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export type UserDetailDocument = IUserDetail & Document;

export default mongoose.model<UserDetailDocument>(
  "UserDetail",
  UserDetailSchema,
);
