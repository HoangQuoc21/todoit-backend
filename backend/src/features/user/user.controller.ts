import type { RequestHandler } from "express";
import { status } from "http-status";
import { validationResult } from "express-validator";
import { userModel } from "./user.model";
import { type ApiResponse, HttpError } from "../../types";
import {
  errorHelper,
  FORM_FIELDS,
  tokenHelper,
  passwordHelper,
} from "../../utils";

const getUser: RequestHandler<{}, {}, {}, { userId: string }> = async (
  req,
  res,
  next,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const { userId } = req.query;

  try {
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "User A user with this ID could not be found",
        null,
      );
      throw error;
    }

    const response: ApiResponse<{
      [FORM_FIELDS.USERID]: string;
      [FORM_FIELDS.EMAIL]: string;
      [FORM_FIELDS.NAME]: string;
    }> = {
      success: true,
      message: "Get user successfully",
      errors: null,
      data: {
        [FORM_FIELDS.USERID]: user._id.toString(),
        [FORM_FIELDS.EMAIL]: user.email,
        [FORM_FIELDS.NAME]: user.name,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const { email, password, name } = req.body;
  const parsedToken = tokenHelper.parseTokenFromRequestHeader(req);
  const userId = parsedToken.userId;
  const accessToken = parsedToken.accessToken;

  try {
    const user = await userModel.findById(userId);
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

    const response: ApiResponse = {
      success: true,
      message: "User updated successfully",
      errors: null,
      data: null,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteUser: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const user = await userModel.findById(userId);
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this ID could not be found",
        null,
      );
      throw error;
    }

    await userModel.findByIdAndDelete(userId);

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

export const userController = {
  getUser,
  editUser,
  deleteUser,
};
