import type { RequestHandler, ErrorRequestHandler } from "express";
import { status } from "http-status";
import type { ApiResponse } from "../types";
import { HttpError } from "../types";
import type { ValidationError } from "express-validator";
import jwt from "jsonwebtoken";

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
  const response: ApiResponse<{ errors: ValidationError[] }> = {
    success: false,
    message: err.message,
    data: {
      errors: err.data,
    },
  };

  res.status(err.statusCode).json(response);
};

const isAuthenticatedHandler: RequestHandler = (req, res, next) => {
  const error = new HttpError(status.UNAUTHORIZED, "Invalid token", []);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw error;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw error;
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    if (!decodedToken) {
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
