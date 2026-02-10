import express from "express";
import { body } from "express-validator";
import { userModel } from "./user.model";
import { userController } from "./user.controller";
import { FORM_FIELDS } from "../../utils";

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
  userController.signUpController,
);
userRouter.post("/sign-in", userController.signInController);

export { userRouter };
