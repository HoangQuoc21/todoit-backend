import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "@/utils";

const TodoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  dueDate: {
    type: Number,
    required: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.CATEGORY,
    required: false,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USER,
    required: true,
  },
});

export const TodoModel = model(SCHEMA_NAME.TODO, TodoSchema);
