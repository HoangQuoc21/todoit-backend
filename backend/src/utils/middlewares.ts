import type { RequestHandler, ErrorRequestHandler } from "express";
import { status } from "http-status";
import { HttpError, type ErrorData, type ApiResponse } from "../types";
import { userModel } from "../features/user/user.model";
import { tokenHelper } from "./helpers";

const rootHandler: RequestHandler = (req, res, next) => {
  const response: ApiResponse<null> = {
    success: true,
    message: "Welcome to Todoit API",
    data: null,
  };

  res.status(status.OK).json(response);
};

const notFoundHandler: RequestHandler = (req, res, next) => {
  console.warn(
    `--> notFoundHandler: ${req.method} ${req.originalUrl} not found`,
  );
  const response: ApiResponse<null> = {
    success: false,
    message: "Route not found",
    data: null,
  };

  res.status(status.NOT_FOUND).json(response);
};

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  console.error(`--> errorHandler: ${err.message} with stack: ${err.stack}`);
  const response: ApiResponse<{ errors: ErrorData } | null> = {
    success: false,
    message: err.message,
    data: err.data ? { errors: err.data } : null,
  };

  res.status(err.statusCode).json(response);
};

const isAuthenticatedHandler: RequestHandler = async (req, res, next) => {
  const error = new HttpError(status.UNAUTHORIZED, "Invalid token", null);

  try {
    const accessToken = tokenHelper.getTokenFromRequestHeader(req);

    const user = await userModel.findOne({
      accessToken: accessToken,
    });

    if (!user) {
      throw error;
    }
  } catch (err) {
    return next(error);
  }

  next();
};

export const middlewares = {
  rootHandler,
  notFoundHandler,
  errorHandler,
  isAuthenticatedHandler,
};
