import mongoose, { Document } from "mongoose";
import { IConversation } from "../Conversation";

const ConversationSchema = new mongoose.Schema(
  {
    tenant_id: {
      type: String,
      required: true,
    },
    owner_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export type ConversationDocument = IConversation & Document;
export default mongoose.model<ConversationDocument>(
  "Conversation",
  ConversationSchema,
);
