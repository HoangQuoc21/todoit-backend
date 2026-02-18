import express from "express";
import { todoController } from "./todo.controller";
import { middlewares } from "../../middlewares";
import { body, param } from "express-validator";
import { FORM_FIELDS } from "../../utils";

const todoRouter = express.Router();

todoRouter.post(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    body(FORM_FIELDS.TITLE).notEmpty().withMessage("Title is required"),
    body(FORM_FIELDS.DESCRIPTION).optional().isString(),
    body(FORM_FIELDS.DUE_DATE)
      .optional()
      .isNumeric()
      .withMessage("Due date must be a numeric timestamp"),
    body(FORM_FIELDS.CATEGORY_ID)
      .optional()
      .isMongoId()
      .withMessage("Invalid category ID"),
  ],
  todoController.createTodo,
);

todoRouter.get(
  "/all",
  middlewares.isAuthenticatedHandler,
  todoController.getTodos,
);

todoRouter.get(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  todoController.getTodo,
);

todoRouter.put(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
    body(FORM_FIELDS.TITLE)
      .optional()
      .notEmpty()
      .withMessage(`${FORM_FIELDS.TITLE} is required`),
    body(FORM_FIELDS.DESCRIPTION).optional().isString(),
    body(FORM_FIELDS.DUE_DATE)
      .optional()
      .isNumeric()
      .withMessage(`${FORM_FIELDS.DUE_DATE} must be a numeric timestamp`),
    body(FORM_FIELDS.IS_COMPLETED)
      .optional()
      .isBoolean()
      .withMessage(`${FORM_FIELDS.IS_COMPLETED} must be a boolean value`),
    body(FORM_FIELDS.CATEGORY_ID)
      .optional()
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  todoController.editTodo,
);

todoRouter.delete(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .isMongoId()
      .withMessage("Invalid MongoDB Category ID format"),
  ],
  todoController.deleteTodo,
);

export { todoRouter };
