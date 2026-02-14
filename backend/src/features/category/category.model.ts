import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "../../utils";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USER,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

export const categoryModel = model(SCHEMA_NAME.CATEGORY, categorySchema);
