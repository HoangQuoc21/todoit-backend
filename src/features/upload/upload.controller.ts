import type { RequestHandler } from "express";
import { status } from "http-status";
import type { ApiResponse, HttpError } from "@/types";
import { errorHelper } from "@/helpers";

const uploadImage: RequestHandler = (req, res, next) => {
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

    return res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.createServerError(err as HttpError));
  }
};

export const uploadController = {
  uploadImage,
};
