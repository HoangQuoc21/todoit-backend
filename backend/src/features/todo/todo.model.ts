import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "../../utils";

const todoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
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
  category: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.CATEGORY,
    required: false,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USER,
    required: true,
  },
});

export const todoModel = model(SCHEMA_NAME.TODO, todoSchema);
