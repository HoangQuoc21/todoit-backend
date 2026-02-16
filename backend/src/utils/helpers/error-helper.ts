import { status } from "http-status";
import { HttpError } from "../../types";

const handleServerError = (error: HttpError) => {
  const serverError = error;
  if (!serverError.statusCode) {
    serverError.statusCode = status.INTERNAL_SERVER_ERROR;
  }

  return serverError;
};

export const errorHelper = {
  handleServerError,
};
