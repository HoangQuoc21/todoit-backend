import { status } from "http-status";
import { HttpError } from "@/types";
import { validationResult } from "express-validator";
import type { NextFunction, Request } from "express";

const createServerError = (error: HttpError) => {
  const serverError = error;
  if (!serverError.statusCode) {
    serverError.statusCode = status.INTERNAL_SERVER_ERROR;
  }
  if (!error.data) {
    serverError.data = null;
  }

  return serverError;
};

const handleValidationError = (req: Request, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const httpError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    next(errorHelper.createServerError(httpError));
    return true;
  }
  return false;
};

export const errorHelper = {
  createServerError,
  handleValidationError,
};
