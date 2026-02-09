import type { ValidationError } from "express-validator";

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: ValidationError[],
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { HttpError };
