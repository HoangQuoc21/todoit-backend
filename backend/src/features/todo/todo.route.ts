import express from "express";
import { todoController } from "./todo.controller";
import { middlewares } from "../../middlewares";
import { body, param } from "express-validator";

const todoRouter = express.Router();

todoRouter.post(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("dueDate")
      .optional()
      .isNumeric()
      .withMessage("Due date must be a numeric timestamp"),
    body("categoryId")
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
    param("id").isMongoId().withMessage("Invalid MongoDB Category ID format"),
  ],
  todoController.getTodo,
);

todoRouter.delete(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param("id").isMongoId().withMessage("Invalid MongoDB Category ID format"),
  ],
  todoController.deleteTodo,
);

export { todoRouter };
