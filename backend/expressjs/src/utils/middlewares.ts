import type { RequestHandler, ErrorRequestHandler } from "express";
import { status } from "http-status";
import type { ApiResponse } from "../types";

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

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(`--> errorHandler: ${err.message} with stack: ${err.stack}`);
  const response: ApiResponse<null> = {
    success: false,
    message: err.message || "Internal Server Error",
    data: err.data || null,
  };

  res.status(err.status || status.INTERNAL_SERVER_ERROR).json(response);
};

export const middlewares = {
  rootHandler,
  notFoundHandler,
  errorHandler,
};
