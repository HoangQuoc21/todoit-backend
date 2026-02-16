import express from "express";
import { categoryController } from "./category.controller";
import { FORM_FIELDS, middlewares } from "../../utils";
import { body, query } from "express-validator";
import { categoryModel } from "./category.model";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    query(FORM_FIELDS.IS_PUBLIC)
      .exists()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} is required`)
      .bail()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_PUBLIC} must be a boolean`),
  ],
  categoryController.getCategories,
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
          name: findingName,
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

export { categoryRouter };
