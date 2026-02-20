import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "@/utils";

const NotificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USER,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Number,
    default: () => Date.now(),
  },
});

export const NotificationModel = model(
  SCHEMA_NAME.NOTIFICATION,
  NotificationSchema,
);
