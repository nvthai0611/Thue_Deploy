import { HousingAreaStatus } from "@src/common/constants";
import mongoose from "mongoose";
import { IHousingArea } from "../HousingArea";

const LocationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const LegalDocumentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, required: true},
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const RatingReplySchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    user_id: { type: String, required: false }, 
  },
  { _id: false },
);

const RatingSchema = new mongoose.Schema(
  {
    user_id: {
      type: String, // Reference to User
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    status: { type: String, default: "pending" },
    created_at: { type: Date, default: Date.now },
    replies: [RatingReplySchema],
  },
);

const pendingUpdateSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    location: LocationSchema,
    expected_rooms: { type: Number },
    legal_documents: [LegalDocumentSchema],
  },
  { _id: false },
);

const HousingAreaSchema = new mongoose.Schema(
  {
    owner_id: {
      type: String,
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: LocationSchema,
    expected_rooms: { type: Number, required: true },
    legal_documents: [LegalDocumentSchema],
    status: {
      type: String,
      enum: HousingAreaStatus,
      default: HousingAreaStatus.pending,
    },
    rating: [RatingSchema],
    admin_unpublished: { type: Boolean, default: false },
    view_count: { type: Number, default: 0 },
    pending_update: pendingUpdateSchema,
    reject_reason: { type: String, default: "" },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false },
);

export type HousingAreaDocument = mongoose.Document & IHousingArea;
export default mongoose.model<HousingAreaDocument>(
  "HousingArea",
  HousingAreaSchema,
  
);
