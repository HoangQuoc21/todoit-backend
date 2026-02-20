import type { RequestHandler, ErrorRequestHandler } from "express";
import { status } from "http-status";
import { HttpError, type ApiResponse } from "./types";
import { UserModel } from "./features/user/user.model";
import { tokenHelper } from "./utils/helpers";
import { param, query } from "express-validator";
import { FORM_FIELDS } from "./utils";
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
  } catch (err) {
    return next(error);
  }

  next();
};

const paginationValidators = [
  query(FORM_FIELDS.PAGE)
    .optional()
    .isInt({ min: 0 })
    .withMessage(`${FORM_FIELDS.PAGE} must be a non-negative integer`),
  query(FORM_FIELDS.SIZE)
    .optional()
    .isInt({ min: 1 })
    .withMessage(`${FORM_FIELDS.SIZE} must be a positive integer`),
];

const paramIdValidator = param(FORM_FIELDS.ID)
  .trim()
  .notEmpty()
  .withMessage(`${FORM_FIELDS.ID} is required`)
  .bail()
  .isMongoId()
  .withMessage("Invalid MongoDB Category ID format");

const imageUploadHandler: RequestHandler = (req, res, next) => {
  cloudinaryService.parser.single(FORM_FIELDS.IMAGE)(req, res, (err) => {
    if (err) {
      return next(
        new HttpError(
          status.INTERNAL_SERVER_ERROR,
          `Image upload failed: ${err.message}`,
          null,
        ),
      );
    }
    next();
  });
};

const uploadHandler: RequestHandler = (req, res, next) => {
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
    console.log("\b --> app.ts:58 --> response:", response);

    res.status(status.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

export const middlewares = {
  rootHandler,
  notFoundHandler,
  errorHandler,
  isAuthenticatedHandler,
  paginationValidators,
  paramIdValidator,
  imageUploadHandler,
  uploadHandler,
};
