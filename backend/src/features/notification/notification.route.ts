import express from "express";
import { notificationController } from "./notification.controller";
import { body, param, query } from "express-validator";
import { FORM_FIELDS } from "../../utils";
import { middlewares } from "../../middlewares";

const notificationRouter = express.Router();

/**
 * @openapi
 * /notification/unread-count:
 *   get:
 *     summary: Get unread notification count for the current user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
notificationRouter.get(
  "/unread-count",
  middlewares.isAuthenticatedHandler,
  notificationController.getUnreadCount,
);

/**
 * @openapi
 * /notification:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *             properties:
 *               userId:
 *                 type: string
 *                 description: MongoDB User ID
 *               title:
 *                 type: string
 *                 description: Notification title
 *               content:
 *                 type: string
 *                 description: Notification content (optional)
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @openapi
 * /notification/all:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                         nullable: true
 *                       isRead:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
notificationRouter.get(
  "/all",
  [
    middlewares.isAuthenticatedHandler,
    query(FORM_FIELDS.PAGE)
      .optional()
      .isInt({ min: 0 })
      .withMessage(`${FORM_FIELDS.PAGE} must be a non-negative integer`),
    query(FORM_FIELDS.SIZE)
      .optional()
      .isInt({ min: 1 })
      .withMessage(`${FORM_FIELDS.SIZE} must be a positive integer`),
  ],
  notificationController.getNotifications,
);

/**
 * @openapi
 * /notification/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Notification ID
 *     responses:
 *       200:
 *         description: Notification details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                     isRead:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *       400:
 *         description: Invalid notification ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if the notification does not belong to the user)
 *       404:
 *         description: Notification not found
 */
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

/**
 * @openapi
 * /notification/mark-read/all:
 *   patch:
 *     summary: Mark all notifications as read for the authenticated user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 */
notificationRouter.patch(
  "/mark-read/all",
  middlewares.isAuthenticatedHandler,
  notificationController.markReadAll,
);

/**
 * @openapi
 * /notification/mark-read/{id}:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       400:
 *         description: Invalid notification ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if the notification does not belong to the user)
 *       404:
 *         description: Notification not found
 */
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

/**
 * @openapi
 * /notification/all:
 *   delete:
 *     summary: Delete all notifications for the authenticated user
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted successfully
 *       401:
 *         description: Unauthorized
 */
notificationRouter.delete(
  "/all",
  middlewares.isAuthenticatedHandler,
  notificationController.deleteNotifications,
);

/**
 * @openapi
 * /notification/{id}:
 *   delete:
 *     summary: Delete a specific notification
 *     tags: [Notification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       400:
 *         description: Invalid notification ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if the notification does not belong to the user)
 *       404:
 *         description: Notification not found
 */
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
