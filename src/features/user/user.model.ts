import { model, Schema } from "mongoose";
import { SCHEMA_NAME } from "@/utils/constants/schema-name";

const UserSchema = new Schema({
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
  image: {
    type: String,
    required: false,
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

export const UserModel = model(SCHEMA_NAME.USER, UserSchema);
