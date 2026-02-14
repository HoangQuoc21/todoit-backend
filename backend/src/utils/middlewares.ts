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
  const response: ApiResponse<{ errors: ErrorData }> = {
    success: false,
    message: err.message,
    data: {
      errors: err.data,
    },
  };

  res.status(err.statusCode).json(response);
};

const isAuthenticatedHandler: RequestHandler = async (req, res, next) => {
  const error = new HttpError(status.UNAUTHORIZED, "Invalid token", null);

  try {
    const accessToken = tokenHelper.getTokenFromRequestHeader(req);
    console.log(
      "\b --> middlewares.ts:50 --> isAuthenticatedHandler --> accessToken:",
      accessToken,
    );

    const parsedToken = tokenHelper.parseToken(accessToken);
    console.log(
      "\b --> middlewares.ts:53 --> isAuthenticatedHandler --> parsedToken:",
      parsedToken,
    );

    if (!parsedToken.userId || !parsedToken.accessToken) {
      throw error;
    }

    const user = await userModel.findOne({
      _id: parsedToken.userId,
      accessToken: parsedToken.accessToken,
    });
    console.log(
      "\b --> middlewares.ts:63 --> isAuthenticatedHandler --> user:",
      user,
    );

    if (!user || user.accessToken !== parsedToken.accessToken) {
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
