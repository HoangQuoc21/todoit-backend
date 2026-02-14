import type { ValidationError } from "express-validator";

type ErrorData = ValidationError[] | null;

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: ErrorData,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export type { ErrorData };
export { HttpError };
