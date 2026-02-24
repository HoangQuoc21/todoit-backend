import express from "express";
import { categoryController } from "./category.controller";
import { FORM_FIELDS } from "@/constants/form-field";
import { body } from "express-validator";
import { middlewares } from "@/middlewares";
import { validators } from "@/validators";

const categoryRouter = express.Router();

/**
 * @openapi
 * /category/all:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Page number (0-indexed)
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         size:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           isPublic:
 *                             type: boolean
 *                           isOwner:
 *                             type: boolean
 *       401:
 *         description: Unauthorized
 */
categoryRouter.get(
  "/all",
  [middlewares.isAuthenticatedHandler, ...validators.paginationValidators],
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
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isPublic:
 *                       type: boolean
 *                     isOwner:
 *                       type: boolean
 *       400:
 *         description: Invalid category ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
categoryRouter.get(
  "/:id",
  [middlewares.isAuthenticatedHandler, validators.paramIdValidator],
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isPublic:
 *                       type: boolean
 *                     isOwner:
 *                       type: boolean
 *       400:
 *         description: Validation error or category already exists
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     isPublic:
 *                       type: boolean
 *                     isOwner:
 *                       type: boolean
 *       400:
 *         description: Validation error or invalid category ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you do not have permission to edit this category
 *       404:
 *         description: Category not found
 */
categoryRouter.put(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    validators.paramIdValidator,
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Invalid category ID format or category is being used by todos
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you do not have permission to delete this category
 *       404:
 *         description: Category not found
 */
categoryRouter.delete(
  "/:id",
  [middlewares.isAuthenticatedHandler, validators.paramIdValidator],
  categoryController.deleteCategory,
);

export { categoryRouter };
