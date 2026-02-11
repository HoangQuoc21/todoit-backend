import express from "express";
import { body, param, query } from "express-validator";
import { userModel } from "./user.model";
import { userController } from "./user.controller";
import { FORM_FIELDS, middlewares } from "../../utils";
import { HttpError } from "../../types";
import { status } from "http-status/nginx";

const userRouter = express.Router();

const PASSWORD_MIN_LENGTH = 6;

userRouter.post(
  "/sign-up",
  [
    body(FORM_FIELDS.EMAIL)
      .isEmail()
      .withMessage("Email must be valid")
      .custom(async (value) => {
        const existingUser = await userModel.findOne({ email: value });
        if (existingUser) {
          return Promise.reject("Email already in use");
        }
      })
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
  userController.signUp,
);

userRouter.post(
  "/sign-in",
  [
    body(FORM_FIELDS.EMAIL).isEmail().withMessage("Email must be valid"),
    body(FORM_FIELDS.PASSWORD)
      .trim()
      .isLength({ min: PASSWORD_MIN_LENGTH })
      .withMessage(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      ),
  ],

  userController.signIn,
);

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
          throw new HttpError(status.NOT_FOUND, "User not found", []);
        }
        return true;
      }),
  ],
  userController.getUser,
);

export { userRouter };
