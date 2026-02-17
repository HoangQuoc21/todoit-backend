import express from "express";
import { categoryController } from "./category.controller";
import { FORM_FIELDS } from "../../utils/constants/form-field";
import { body, param } from "express-validator";
import { middlewares } from "../../middlewares";

const categoryRouter = express.Router();

/**
 * @openapi
 * /category/all:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   isPublic:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 */
categoryRouter.get(
  "/all",
  middlewares.isAuthenticatedHandler,
  categoryController.getCategories,
);

/**
 * @openapi
 * /category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Category ID
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *       400:
 *         description: Invalid category ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
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

/**
 * @openapi
 * /category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - isPublic
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the category is public or private
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @openapi
 * /category/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - isPublic
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the category is public or private
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation error or invalid category ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
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

/**
 * @openapi
 * /category/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
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
