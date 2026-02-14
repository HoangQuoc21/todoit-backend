import type { RequestHandler } from "express";
import { type ApiResponse } from "../../types";
import { status } from "http-status";

const getCategories: RequestHandler = async (req, res, next) => {
  const response: ApiResponse = {
    success: true,
    message: "Get categories successfully",
    errors: null,
    data: null,
  };

  res.status(status.OK).json(response);
};

export const categoryController = {
  getCategories,
};
