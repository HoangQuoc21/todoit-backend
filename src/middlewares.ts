import type { RequestHandler, ErrorRequestHandler } from "express";
import { status } from "http-status";
import { HttpError, type ApiResponse } from "./types";
import { UserModel } from "./features/user/user.model";
import { errorHelper, FORM_FIELDS, tokenHelper } from "./utils";
import { cloudinaryService } from "./services";

const rootHandler: RequestHandler = (req, res, next) => {
  const response: ApiResponse = {
    success: true,
    message: "Welcome to Todoit API",
    errors: null,
    data: null,
  };

  res.status(status.OK).json(response);
};

const notFoundHandler: RequestHandler = (req, res, next) => {
  console.warn(
    `--> notFoundHandler: ${req.method} ${req.originalUrl} not found`,
  );
  const response: ApiResponse = {
    success: false,
    message: "Route not found",
    errors: null,
    data: null,
  };

  res.status(status.NOT_FOUND).json(response);
};

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  console.error(`--> errorHandler: ${err.message} with stack: ${err.stack}`);
  const response: ApiResponse = {
    success: false,
    message: err.message,
    errors: err.data,
    data: null,
  };

  res.status(err.statusCode).json(response);
};

const isAuthenticatedHandler: RequestHandler = async (req, res, next) => {
  const error = new HttpError(status.UNAUTHORIZED, "Invalid token", null);

  try {
    const accessToken = tokenHelper.getTokenFromRequestHeader(req);

    const user = await UserModel.findOne({
      accessToken: accessToken,
    });

    if (!user) {
      throw error;
    }

    next();
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const cloudinaryUploadHandler: RequestHandler = (req, res, next) => {
  cloudinaryService.parser.single(FORM_FIELDS.IMAGE)(req, res, (err) => {
    if (err) {
      next(errorHelper.handleServerError(err as HttpError));
    } else {
      next();
    }
  });
};

const uploadImageHandler: RequestHandler = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(status.BAD_REQUEST).json({
        success: false,
        message: "No file uploaded",
        errors: null,
        data: null,
      });
    }

    const response: ApiResponse<string> = {
      success: true,
      message: "File uploaded successfully",
      errors: null,
      data: req.file.path,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const middlewares = {
  rootHandler,
  notFoundHandler,
  errorHandler,
  isAuthenticatedHandler,
  cloudinaryUploadHandler,
  uploadImageHandler,
};
