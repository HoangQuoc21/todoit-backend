import type { RequestHandler } from "express";
import type { ApiResponse } from "../../types";
import { status } from "http-status/unofficial";

const getCategories: RequestHandler = async (req, res, next) => {
  const response: ApiResponse<null> = {
    success: true,
    message: "Get categories successfully",
    data: null,
  };

  res.status(status.OK).json(response);
};

export const categoryController = {
  getCategories,
};
