import { type ValidationError } from "express-validator";

type HttpErrorData = ValidationError[] | null;

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: HttpErrorData,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

type ApiResponse<T = null> = {
  success: boolean;
  message?: string;
  errors: HttpErrorData;
  data: T;
};

export { type ApiResponse, HttpError };
