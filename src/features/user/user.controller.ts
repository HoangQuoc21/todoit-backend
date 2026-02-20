import type { RequestHandler } from "express";
import { status } from "http-status";
import { UserModel } from "./user.model";
import { type ApiResponse, HttpError, type User } from "@/types";
import { errorHelper, tokenHelper, passwordHelper } from "@/utils";

const getUser: RequestHandler<{ id: string }> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

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
        accessToken: null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const editUser: RequestHandler<
  {},
  {},
  { email: string; password: string; name: string }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  const { email, password, name } = req.body;
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
    if (password !== user.password) {
      user.password = await passwordHelper.hashPassword(password);
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
        accessToken: null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteUser: RequestHandler = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

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

    await UserModel.findByIdAndDelete(userId);

    const response: ApiResponse = {
      success: true,
      message: "User deleted successfully",
      errors: null,
      data: null,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getMe: RequestHandler = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

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
        accessToken: null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const updatePushToken: RequestHandler<{}, {}, { pushToken: string }> = async (
  req,
  res,
  next,
) => {
  errorHelper.handleValidationError(req, next);

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

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const userController = {
  getUser,
  editUser,
  deleteUser,
  getMe,
  updatePushToken,
};
