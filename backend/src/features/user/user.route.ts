import express from "express";
import { body, param } from "express-validator";
import { userController } from "./user.controller";
import { FORM_FIELDS, PASSWORD_MIN_LENGTH } from "../../utils";
import { middlewares } from "../../middlewares";

const userRouter = express.Router();

userRouter.get(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.ID} is required`)
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB User ID format"),
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
