import express from "express";
import { query } from "express-validator";
import { userModel } from "./user.model";
import { userController } from "./user.controller";
import { FORM_FIELDS, middlewares } from "../../utils";
import { HttpError } from "../../types";
import { status } from "http-status";

const userRouter = express.Router();

userRouter.get(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    query(FORM_FIELDS.USERID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.USERID} is required`)
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB User ID format")
      .bail()
      .custom(async (value) => {
        const user = await userModel.findById(value);
        if (!user) {
          throw new HttpError(status.NOT_FOUND, "User not found", null);
        }
        return true;
      }),
  ],
  userController.getUser,
);

export { userRouter };
