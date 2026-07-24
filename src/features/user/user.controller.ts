import type { RequestHandler } from "express";
import { status } from "http-status";
import { UserModel } from "./user.model";
import { type ApiResponse, HttpError, type User } from "@/types";
import { errorHelper, tokenHelper, passwordHelper } from "@/helpers";
import { cloudinaryService } from "@/services";

const getUser: RequestHandler<{ id: string }> = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  const { id } = req.params;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    const response: ApiResponse<User> = {
      success: true,
      message: "Get user successfully",
      errors: null,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl ?? null,
        accessToken: null,
        pushToken: null,
      },
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

const editUser: RequestHandler<
  {},
  {},
  { email: string; password?: string; name: string; imageUrl?: string }
> = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  const { email, password, name, imageUrl } = req.body;
  const id = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    user.email = email;
    user.name = name;
    if (password && password !== user.password) {
      user.password = await passwordHelper.hashPassword(password);
    }
    if (imageUrl) {
      if (imageUrl !== user.imageUrl) {
        const oldImageUrl = user.imageUrl;
        if (oldImageUrl) {
          cloudinaryService
            .deleteImage(oldImageUrl)
            .then((result) => {
              console.log(
                "\b --> user.controller.ts:111 --> editUser --> result:",
                result,
              );
            })
            .catch((err) => {
              console.error(
                "\b --> user.controller.ts:113 --> editUser --> error:",
                err,
              );
            });
        }
      }
      user.imageUrl = imageUrl;
    } else {
      user.imageUrl = null;
    }

    await user.save();

    const response: ApiResponse<User> = {
      success: true,
      message: "User updated successfully",
      errors: null,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl ?? null,
        accessToken: user.accessToken ?? null,
        pushToken: user.pushToken ?? null,
      },
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

const deleteUser: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    if (user.imageUrl) {
      cloudinaryService
        .deleteImage(user.imageUrl)
        .then((result) => {
          console.log(
            "\b --> user.controller.ts:111 --> deleteUser --> result:",
            result,
          );
        })
        .catch((err) => {
          console.error(
            "\b --> user.controller.ts:113 --> deleteUser --> error:",
            err,
          );
        });
    }

    await UserModel.findByIdAndDelete(userId);

    const response: ApiResponse = {
      success: true,
      message: "User deleted successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

const getMe: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    const response: ApiResponse<User> = {
      success: true,
      message: "Get user successfully",
      errors: null,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl ?? null,
        accessToken: user.accessToken ?? null,
        pushToken: user.pushToken ?? null,
      },
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

const updatePushToken: RequestHandler<{}, {}, { pushToken: string }> = async (
  req,
  res,
  next,
) => {
  if (errorHelper.handleValidationError(req, next)) return;

  const { pushToken } = req.body;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    user.pushToken = pushToken;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "Push token updated successfully",
      errors: null,
      data: null,
    };

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

export const userController = {
  getUser,
  editUser,
  deleteUser,
  getMe,
  updatePushToken,
};
