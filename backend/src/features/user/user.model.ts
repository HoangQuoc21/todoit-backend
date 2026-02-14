import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "../../utils/constants/schema-name";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  pushToken: {
    type: String,
    required: false,
  },
  accessToken: {
    type: String,
    required: false,
  },
});

export const userModel = model(SCHEMA_NAME.USER, userSchema);
