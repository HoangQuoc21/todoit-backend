import { ObjectId } from "mongodb";
import type { RequestHandler } from "express";
import {
  HttpError,
  type ApiResponse,
  type ListResponse,
  type Notification,
} from "@/types";
import { status } from "http-status";
import { errorHelper, tokenHelper } from "@/helpers";
import { PAGINATION } from "@/constants";
import { NotificationModel } from "./notification.model";
import { UserModel } from "../user";
import { pushNotificationService } from "@/services";

const createNotification: RequestHandler<
  {},
  {},
  { userId: string; title: string; content?: string }
> = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const { userId, title, content } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new HttpError(status.BAD_REQUEST, "User not found", null);
    }

    const pushResult = await pushNotificationService.sendExpoPushNotification({
      pushToken: user.pushToken,
      title,
      body: content,
    });

    const newNotification = new NotificationModel({
      userId: new ObjectId(userId),
      title,
      content: content ?? null,
    });

    await newNotification.save();

    const response: ApiResponse<Notification> = {
      success: true,
      message: `Notification created successfully, push result: ${pushResult.message}`,
      errors: null,
      data: {
        id: newNotification._id.toString(),
        title: newNotification.title,
        content: newNotification.content ?? null,
        isRead: newNotification.isRead,
        sentAt: newNotification.sentAt,
      },
    };
    return res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getNotifications: RequestHandler = async (
  req: {
    query: { page?: number; size?: number };
  },
  res,
  next,
) => {
  if (errorHelper.handleValidationError(req as any, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req as any).userId;
    const page = req.query.page ?? Number(PAGINATION.DEFAULT_PAGE);
    const size = req.query.size ?? Number(PAGINATION.DEFAULT_SIZE);

    const totalItems = await NotificationModel.countDocuments({
      userId: new ObjectId(userId),
    });
    const totalPages = Math.ceil(totalItems / size);

    const items = await NotificationModel.find({
      userId: new ObjectId(userId),
    })
      .sort({ sentAt: -1 })
      .skip(page * size)
      .limit(size);

    const response: ApiResponse<ListResponse<Notification>> = {
      success: true,
      message: "Notifications retrieved successfully",
      errors: null,
      data: {
        meta: {
          page,
          size,
          totalItems,
          totalPages,
        },
        items: items.map((notification) => ({
          id: notification._id.toString(),
          title: notification.title,
          content: notification.content ?? null,
          isRead: notification.isRead,
          sentAt: notification.sentAt,
        })),
      },
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getNotification: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const notificationId = req.params.id;

    const notification = await NotificationModel.findOne({
      _id: new ObjectId(notificationId),
    });

    if (!notification) {
      throw new HttpError(status.NOT_FOUND, "Notification not found", null);
    }

    if (notification.userId.toString() !== userId) {
      throw new HttpError(
        status.FORBIDDEN,
        "You do not have access to this notification",
        null,
      );
    }

    const response: ApiResponse<Notification> = {
      success: true,
      message: "Notification retrieved successfully",
      errors: null,
      data: {
        id: notification._id.toString(),
        title: notification.title,
        content: notification.content ?? null,
        isRead: notification.isRead,
        sentAt: notification.sentAt,
      },
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getUnreadCount: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

    const unreadCount = await NotificationModel.countDocuments({
      userId: new ObjectId(userId),
      isRead: false,
    });

    const response: ApiResponse<number> = {
      success: true,
      message: "Unread notification count retrieved successfully",
      errors: null,
      data: unreadCount,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const markRead: RequestHandler<{ id: string }> = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const notificationId = req.params.id;

    const notification = await NotificationModel.findOne({
      _id: new ObjectId(notificationId),
    });

    if (!notification) {
      throw new HttpError(status.NOT_FOUND, "Notification not found", null);
    }

    if (notification.userId.toString() !== userId) {
      throw new HttpError(
        status.FORBIDDEN,
        "You do not have access to this notification",
        null,
      );
    }

    notification.isRead = true;
    await notification.save();

    const response: ApiResponse = {
      success: true,
      message: "Notification marked as read successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const markReadAll: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

    await NotificationModel.updateMany(
      { userId: new ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    );

    const response: ApiResponse = {
      success: true,
      message: "All notifications marked as read successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteNotifications: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

    await NotificationModel.deleteMany({ userId: new ObjectId(userId) });

    const response: ApiResponse = {
      success: true,
      message: "All notifications deleted successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteNotification: RequestHandler<{ id: string }> = async (
  req,
  res,
  next,
) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const notificationId = req.params.id;

    const notification = await NotificationModel.findOne({
      _id: new ObjectId(notificationId),
    });

    if (!notification) {
      throw new HttpError(status.NOT_FOUND, "Notification not found", null);
    }

    if (notification.userId.toString() !== userId) {
      throw new HttpError(
        status.FORBIDDEN,
        "You do not have access to this notification",
        null,
      );
    }

    await NotificationModel.deleteOne({ _id: new ObjectId(notificationId) });

    const response: ApiResponse = {
      success: true,
      message: "Notification deleted successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const notificationController = {
  createNotification,
  getNotifications,
  getNotification,
  getUnreadCount,
  markRead,
  markReadAll,
  deleteNotifications,
  deleteNotification,
};
