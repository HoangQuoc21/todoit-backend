import { status } from "http-status";
import { HttpError } from "@/types";
import { validationResult } from "express-validator";
import type { NextFunction, Request } from "express";

const handleServerError = (error: HttpError) => {
  const serverError = error;
  if (!serverError.statusCode) {
    serverError.statusCode = status.INTERNAL_SERVER_ERROR;
  }

  return serverError;
};

const handleValidationError = (req: Request, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }
};

export const errorHelper = {
  handleServerError,
  handleValidationError,
};
