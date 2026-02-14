import express from "express";
import { body } from "express-validator";
import { userModel } from "../user/user.model";
import { authController } from "./auth.controller";
import { FORM_FIELDS, middlewares } from "../../utils";

const authRouter = express.Router();

const PASSWORD_MIN_LENGTH = 6;

authRouter.post(
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
  authController.signUp,
);

authRouter.post(
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
  authController.signIn,
);

authRouter.post(
  "/sign-out",
  middlewares.isAuthenticatedHandler,
  authController.signOut,
);

export { authRouter };
