import express from "express";
import { categoryController } from "./category.controller";
import { FORM_FIELDS } from "../../utils/constants/form-field";
import { body, param } from "express-validator";
import { middlewares } from "../../middlewares";

const categoryRouter = express.Router();

categoryRouter.get(
  "/all",
  middlewares.isAuthenticatedHandler,
  categoryController.getCategories,
);

categoryRouter.get(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.ID} is required`)
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  categoryController.getCategory,
);

categoryRouter.post(
  "/",
  [
    middlewares.isAuthenticatedHandler,

    body(FORM_FIELDS.NAME)
      .exists()
      .trim()
      .withMessage(`${FORM_FIELDS.NAME} is required`)
      .bail()
      .isString()
      .withMessage(`${FORM_FIELDS.NAME} must be a string`),
    body(FORM_FIELDS.IS_PUBLIC)
      .exists()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} is required`)
      .bail()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} must be a boolean`),
  ],
  categoryController.createCategory,
);

categoryRouter.put(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.ID} is required`)
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
    body(FORM_FIELDS.NAME)
      .exists()
      .trim()
      .withMessage(`${FORM_FIELDS.NAME} is required`)
      .bail()
      .isString()
      .withMessage(`${FORM_FIELDS.NAME} must be a string`),
    body(FORM_FIELDS.IS_PUBLIC)
      .exists()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} is required`)
      .bail()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} must be a boolean`),
  ],
  categoryController.editCategory,
);

categoryRouter.delete(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .trim()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.ID} is required`)
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  categoryController.deleteCategory,
);

export { categoryRouter };
