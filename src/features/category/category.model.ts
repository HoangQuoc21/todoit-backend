import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "@/constants";

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USER,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

export const CategoryModel = model(SCHEMA_NAME.CATEGORY, CategorySchema);
