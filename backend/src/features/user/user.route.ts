import express from "express";
import { query, body } from "express-validator";
import { userModel } from "./user.model";
import { userController } from "./user.controller";
import { FORM_FIELDS, middlewares, PASSWORD_MIN_LENGTH } from "../../utils";
import { HttpError } from "../../types";
import { status } from "http-status";

const userRouter = express.Router();

userRouter.get(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    query(FORM_FIELDS.ID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.ID} is required`)
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

userRouter.put(
  "/",
  [
    body(FORM_FIELDS.EMAIL)
      .isEmail()
      .withMessage("Email must be valid")
      .normalizeEmail(),
    body(FORM_FIELDS.PASSWORD)
      .trim()
      .isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      ),
    body(FORM_FIELDS.NAME)
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name is required"),
  ],
  userController.editUser,
);

userRouter.delete(
  "/",
  middlewares.isAuthenticatedHandler,
  userController.deleteUser,
);

export { userRouter };
