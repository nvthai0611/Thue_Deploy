import mongoose, { Document } from "mongoose";
import { IRoom } from "../Room";
import { RoomStatus, RoomType } from "@src/common/constants";

const FacilitiesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: Number, required: true },
  },
  { _id: false },
);

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, required: false },
    uploaded_at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const BoostHistorySchema = new mongoose.Schema(
  {
    start_at: { type: Date, required: true , default: Date.now() },
    end_at: { type: Date, required: true }, 
  },
  { _id: false },
);

const RentalHistorySchema = new mongoose.Schema(
  {
    tenant_id: {
      type: String,
      required: true,
    },
    contract_id: {
      type: String,
      required: true,
    },
    start_date: { type: Date, required: true , default: Date.now() },
    end_date: { type: Date, required: true },
  },
  { _id: false },
);
const RoomSchema = new mongoose.Schema(
  {
    housing_area_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HousingArea",
      required: true,
    },
    tenant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      reqired: false,
    },
    room_number: { type: String, required: true }, 
    title: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: Number, required: true }, 
    facilities: [FacilitiesSchema],
    images: [ImageSchema],
    boost_history: [BoostHistorySchema],
    type: { type: String, enum: RoomType, required: true }, 
    max_occupancy: { type: Number, required: true }, 
    status: {
      type: String,
      enum: RoomStatus,
      default: RoomStatus.available,
      required: true,
    },
    rental_history: [RentalHistorySchema],
    boost_status: { type: Boolean, default: false },
    boost_start_at: { type: Date, default: null }, 
    boost_end_at: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);
export type RoomDocument = IRoom & Document;
export default mongoose.model<RoomDocument>("Room", RoomSchema);
