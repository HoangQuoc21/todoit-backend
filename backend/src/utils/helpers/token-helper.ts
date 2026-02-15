import generateApiKey from "generate-api-key";
import type { Request } from "express";
import { HttpError } from "../../types";
import { status } from "http-status";

export const tokenHelper = {
  generateToken: (userId: string) => {
    const result = generateApiKey({
      method: "string",
      prefix: userId,
      pool: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      length: 32,
    });
    return result.toString();
  },
  parseTokenFromRequestHeader: (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(
        status.BAD_REQUEST,
        "No authorization header provided",
        null,
      );
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      throw new HttpError(status.BAD_REQUEST, "No bearer token provided", null);
    }

    const parts = accessToken.split(".");
    return {
      userId: parts[0],
      accessToken: parts[1],
    };
  },
  getTokenFromRequestHeader: (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(
        status.BAD_REQUEST,
        "No authorization header provided",
        null,
      );
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      throw new HttpError(status.BAD_REQUEST, "No bearer token provided", null);
    }

    return accessToken;
  },
};
