import express from "express";
import { todoController } from "./todo.controller";
import { middlewares } from "@/middlewares";
import { validators } from "@/validators";
import { body } from "express-validator";
import { FORM_FIELDS } from "@/constants";

const todoRouter = express.Router();

/**
 * @openapi
 * /todo:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Todo title
 *               content:
 *                 type: string
 *                 description: Todo content (optional)
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: Cloudinary image URL (optional)
 *               dueDate:
 *                 type: number
 *                 description: Due date as numeric timestamp (optional)
 *               categoryId:
 *                 type: string
 *                 description: MongoDB Category ID (optional)
 *     responses:
 *       201:
 *         description: Todo created successfully
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
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                       nullable: true
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     dueDate:
 *                       type: number
 *                       nullable: true
 *                     isCompleted:
 *                       type: boolean
 *                     category:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isPublic:
 *                           type: boolean
 *                         isOwner:
 *                           type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
todoRouter.post(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    body(FORM_FIELDS.TITLE)
      .notEmpty()
      .withMessage(`${FORM_FIELDS.TITLE} is required`),
    body(FORM_FIELDS.CONTENT).optional().isString(),
    body(FORM_FIELDS.DUE_DATE)
      .optional()
      .isNumeric()
      .withMessage(`${FORM_FIELDS.DUE_DATE} must be a numeric timestamp`),
    body(FORM_FIELDS.CATEGORY_ID)
      .optional()
      .isMongoId()
      .withMessage(`${FORM_FIELDS.CATEGORY_ID} must be a valid category ID`),
    validators.bodyImageUrlValidator,
  ],
  todoController.createTodo,
);

/**
 * @openapi
 * /todo/all:
 *   get:
 *     summary: Get all todos for the authenticated user
 *     tags: [Todo]
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
 *         description: Number of items per page (default 20)
 *     responses:
 *       200:
 *         description: List of all todos
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
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                             nullable: true
 *                           imageUrl:
 *                             type: string
 *                             nullable: true
 *                           dueDate:
 *                             type: number
 *                             nullable: true
 *                           isCompleted:
 *                             type: boolean
 *                           category:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               isPublic:
 *                                 type: boolean
 *                               isOwner:
 *                                 type: boolean
 *       401:
 *         description: Unauthorized
 */
todoRouter.get(
  "/all",
  [middlewares.isAuthenticatedHandler, ...validators.paginationValidators],
  todoController.getTodos,
);

/**
 * @openapi
 * /todo/{id}:
 *   get:
 *     summary: Get a specific todo by ID
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Todo ID
 *     responses:
 *       200:
 *         description: Todo details retrieved successfully
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
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                       nullable: true
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     dueDate:
 *                       type: number
 *                       nullable: true
 *                     isCompleted:
 *                       type: boolean
 *                     category:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isPublic:
 *                           type: boolean
 *                         isOwner:
 *                           type: boolean
 *       400:
 *         description: Invalid todo ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
todoRouter.get(
  "/:id",
  [middlewares.isAuthenticatedHandler, validators.paramIdValidator],
  todoController.getTodo,
);

/**
 * @openapi
 * /todo/{id}:
 *   put:
 *     summary: Update a todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Todo title (optional)
 *               content:
 *                 type: string
 *                 description: Todo content (optional)
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: Cloudinary image URL (optional)
 *               dueDate:
 *                 type: number
 *                 description: Due date as numeric timestamp (optional)
 *               categoryId:
 *                 type: string
 *                 description: MongoDB Category ID (optional)
 *     responses:
 *       200:
 *         description: Todo updated successfully
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
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                       nullable: true
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     dueDate:
 *                       type: number
 *                       nullable: true
 *                     isCompleted:
 *                       type: boolean
 *                     category:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isPublic:
 *                           type: boolean
 *                         isOwner:
 *                           type: boolean
 *       400:
 *         description: Validation error or invalid todo ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you do not have permission to edit this todo
 *       404:
 *         description: Todo not found
 */
todoRouter.put(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    validators.paramIdValidator,
    body(FORM_FIELDS.TITLE)
      .optional()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.TITLE} is required`),
    body(FORM_FIELDS.CONTENT).optional().isString(),
    body(FORM_FIELDS.DUE_DATE)
      .optional()
      .isNumeric()
      .withMessage(`${FORM_FIELDS.DUE_DATE} must be a numeric timestamp`),
    body(FORM_FIELDS.CATEGORY_ID)
      .optional()
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  validators.bodyImageUrlValidator,
  todoController.editTodo,
);

/**
 * @openapi
 * /todo/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
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
 *         description: Invalid todo ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
todoRouter.delete(
  "/:id",
  [middlewares.isAuthenticatedHandler, validators.paramIdValidator],
  todoController.deleteTodo,
);

/**
 * @openapi
 * /todo/{id}/toggle-completed:
 *   patch:
 *     summary: Toggle the completion status of a todo
 *     tags: [Todo]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isCompleted
 *             properties:
 *               isCompleted:
 *                 type: boolean
 *                 description: New completion status
 *     responses:
 *       200:
 *         description: Todo completion status updated successfully
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
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                       nullable: true
 *                     imageUrl:
 *                       type: string
 *                       nullable: true
 *                     dueDate:
 *                       type: number
 *                       nullable: true
 *                     isCompleted:
 *                       type: boolean
 *                     category:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         isPublic:
 *                           type: boolean
 *                         isOwner:
 *                           type: boolean
 *       400:
 *         description: Validation error or invalid todo ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
todoRouter.patch(
  "/:id/toggle-completed",
  [
    middlewares.isAuthenticatedHandler,
    validators.paramIdValidator,
    body(FORM_FIELDS.IS_COMPLETED)
      .exists()
      .withMessage(`${FORM_FIELDS.IS_COMPLETED} is required`)
      .bail()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_COMPLETED} must be a boolean value`),
  ],
  todoController.toggleCompleted,
);

export { todoRouter };
