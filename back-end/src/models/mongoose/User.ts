import { RoleEnum } from "@src/common/constants";
import mongoose, { Document } from "mongoose";
import { IUser } from "../User";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: Object.values(RoleEnum), default: "user" },
    phone: { type: String, required: true },
  },
  { timestamps: false, versionKey: false },
);

// Kiểu dữ liệu cho document trả về từ Mongoose
export type UserDocument = IUser & Document;

// Export model với kiểu dữ liệu
export default mongoose.model<UserDocument>("User", UserSchema);
