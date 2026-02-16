import express from "express";
import { categoryController } from "./category.controller";
import { FORM_FIELDS } from "../../utils/constants/form-field";
import { body, param, query } from "express-validator";
import { categoryModel } from "./category.model";
import { middlewares } from "../../middlewares";
import { status } from "http-status/unofficial";
import { HttpError } from "../../types";

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
      .withMessage("Invalid MongoDB Category ID format")
      .bail()
      .custom(async (value) => {
        const category = await categoryModel.findById(value);
        if (!category) {
          throw new HttpError(status.NOT_FOUND, "Category not found", null);
        }
        return true;
      }),
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
      .withMessage(`${FORM_FIELDS.NAME} must be a string`)
      .custom(async (name: string) => {
        const findingName = name.trim().toLowerCase();
        const existedCategory = await categoryModel.findOne({
          name: { $regex: new RegExp(`^${findingName}$`, "i") },
        });
        if (existedCategory) {
          return Promise.reject("Category already exists");
        }
        return true;
      }),
    body(FORM_FIELDS.IS_PUBLIC)
      .exists()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} is required`)
      .bail()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} must be a boolean`),
  ],
  categoryController.createCategory,
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
      .withMessage("Invalid MongoDB Category ID format")
      .bail()
      .custom(async (value) => {
        const category = await categoryModel.findById(value);
        if (!category) {
          throw new HttpError(status.NOT_FOUND, "Category not found", null);
        }
        return true;
      }),
  ],
  categoryController.deleteCategory,
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
      .withMessage("Invalid MongoDB Category ID format")
      .bail()
      .custom(async (value) => {
        const category = await categoryModel.findById(value);
        if (!category) {
          throw new HttpError(status.NOT_FOUND, "Category not found", null);
        }
        return true;
      }),
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

export { categoryRouter };
