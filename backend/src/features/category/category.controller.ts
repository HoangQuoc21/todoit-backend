import type { RequestHandler } from "express";
import { HttpError, type ApiResponse } from "../../types";
import { status } from "http-status";
import { errorHelper, tokenHelper } from "../../utils";
import { validationResult } from "express-validator";
import { categoryModel } from "./category.model";

const getCategories: RequestHandler<{}, {}, { isPublic: boolean }> = async (
  req,
  res,
  next,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const isPublic = Boolean(req.query.isPublic);

  try {
    const categories = await categoryModel
      .find({
        isPublic,
      })
      .sort({ name: 1 });

    const response: ApiResponse<typeof categories> = {
      success: true,
      message: "Get categories successfully",
      errors: null,
      data: categories,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const createCategory: RequestHandler<
  {},
  {},
  { name: string; isPublic: boolean }
> = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const { name, isPublic } = req.body;

  const createdBy = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const newCategory = new categoryModel({
      name,
      isPublic,
      createdBy,
    });
    await newCategory.save();

    const response: ApiResponse = {
      success: true,
      message: "Category created successfully",
      errors: null,
      data: null,
    };

    res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const categoryController = {
  getCategories,
  createCategory,
};
