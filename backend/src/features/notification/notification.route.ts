import express from "express";
import { notificationController } from "./notification.controller";
import { body, param } from "express-validator";
import { FORM_FIELDS } from "../../utils";
import { middlewares } from "../../middlewares";

const notificationRouter = express.Router();

notificationRouter.get(
  "/unread-count",
  middlewares.isAuthenticatedHandler,
  notificationController.getUnreadCount,
);

notificationRouter.post(
  "/",
  [
    middlewares.isAuthenticatedHandler,
    body(FORM_FIELDS.USER_ID)
      .notEmpty()
      .withMessage("User ID is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB ObjectId format for User ID"),
    body(FORM_FIELDS.TITLE)
      .notEmpty()
      .withMessage("Title is required")
      .bail()
      .isString()
      .withMessage("Title must be a string"),
    body(FORM_FIELDS.CONTENT)
      .optional()
      .isString()
      .withMessage("Content must be a string"),
  ],
  notificationController.createNotification,
);

notificationRouter.get(
  "/all",
  middlewares.isAuthenticatedHandler,
  notificationController.getNotifications,
);

notificationRouter.get(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .notEmpty()
      .withMessage("ID is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB ObjectId format for ID"),
  ],
  notificationController.getNotification,
);

notificationRouter.patch(
  "/mark-read/all",
  middlewares.isAuthenticatedHandler,
  notificationController.markReadAll,
);

notificationRouter.patch(
  "/mark-read/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .notEmpty()
      .withMessage("ID is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB ObjectId format for ID"),
  ],
  notificationController.markRead,
);

notificationRouter.delete(
  "/all",
  middlewares.isAuthenticatedHandler,
  notificationController.deleteNotifications,
);

notificationRouter.delete(
  "/:id",
  [
    middlewares.isAuthenticatedHandler,
    param(FORM_FIELDS.ID)
      .notEmpty()
      .withMessage("ID is required")
      .bail()
      .isMongoId()
      .withMessage("Invalid MongoDB ObjectId format for ID"),
  ],
  notificationController.deleteNotification,
);

export { notificationRouter };
