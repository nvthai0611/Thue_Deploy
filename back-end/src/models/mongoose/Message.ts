import mongoose, { Document } from "mongoose";
import { IMessage } from "../Message";

const MessageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender_id: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    send_at: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

export type MessageDocument = Document & IMessage;

export default mongoose.model<MessageDocument>("Message", MessageSchema);
