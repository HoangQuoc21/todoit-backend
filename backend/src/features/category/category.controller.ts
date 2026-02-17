import type { RequestHandler } from "express";
import { HttpError, type ApiResponse, type Category } from "../../types";
import { status } from "http-status";
import { errorHelper, tokenHelper } from "../../utils";
import { validationResult } from "express-validator";
import { categoryModel } from "./category.model";
import { ObjectId } from "mongodb";
import { todoModel } from "../todo/todo.model";

const getCategories: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const categories = await categoryModel
      .find({
        $or: [{ isPublic: true }, { createdBy: new ObjectId(userId) }],
      })
      .sort({ name: 1 });

    const response: ApiResponse<Category[]> = {
      success: true,
      message: "Get categories successfully",
      errors: null,
      data: categories.map((category) => ({
        id: category._id.toString(),
        name: category.name,
        isPublic: category.isPublic,
        isOwner: category.createdBy.toString() === userId,
      })),
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getCategory: RequestHandler<{ id: string }> = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const { id } = req.params;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const category = await categoryModel.findById(id);

    if (!category) {
      const error = new HttpError(status.NOT_FOUND, "Category not found", null);
      throw error;
    }

    const response: ApiResponse<Category> = {
      success: true,
      message: "Get category successfully",
      errors: null,
      data: {
        id: category._id.toString(),
        name: category.name,
        isPublic: category.isPublic,
        isOwner: category.createdBy.toString() === userId,
      },
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
    const findingName = name.trim().toLowerCase();
    const existedCategory = await categoryModel.findOne({
      name: { $regex: new RegExp(`^${findingName}$`, "i") },
    });
    if (existedCategory) {
      throw new HttpError(status.BAD_REQUEST, "Category already exists", null);
    }

    const newCategory = new categoryModel({
      name,
      isPublic,
      createdBy,
    });
    await newCategory.save();

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category created successfully",
      errors: null,
      data: {
        id: newCategory._id.toString(),
        name: newCategory.name,
        isPublic: newCategory.isPublic,
        isOwner: newCategory.createdBy.toString() === createdBy,
      },
    };

    res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const editCategory: RequestHandler<
  { id: string },
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

  const { id } = req.params;
  const { name, isPublic } = req.body;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const category = await categoryModel.findById(id);

    if (!category) {
      const error = new HttpError(status.NOT_FOUND, "Category not found", null);
      throw error;
    }

    if (category.createdBy.toString() !== userId) {
      const error = new HttpError(
        status.FORBIDDEN,
        "You do not have permission to edit this category",
        null,
      );
      throw error;
    }

    category.name = name;
    category.isPublic = isPublic;
    await category.save();

    const response: ApiResponse<Category> = {
      success: true,
      message: "Category updated successfully",
      errors: null,
      data: {
        id: category._id.toString(),
        name: category.name,
        isPublic: category.isPublic,
        isOwner: category.createdBy.toString() === userId,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteCategory: RequestHandler<{ id: string }> = async (
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

  const { id } = req.params;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const deletingCategory = await categoryModel.findById(id);

    if (!deletingCategory) {
      const error = new HttpError(status.NOT_FOUND, "Category not found", null);
      throw error;
    }

    if (deletingCategory.createdBy.toString() !== userId) {
      const error = new HttpError(
        status.FORBIDDEN,
        "You do not have permission to delete this category",
        null,
      );
      throw error;
    }

    const todosUsingCategory = await todoModel
      .find({ category: new ObjectId(id) })
      .limit(1);
    if (todosUsingCategory.length > 0) {
      const error = new HttpError(
        status.BAD_REQUEST,
        "Cannot delete category that is being used by todos",
        null,
      );
      throw error;
    }

    await categoryModel.findByIdAndDelete(id);

    const response: ApiResponse = {
      success: true,
      message: "Category deleted successfully",
      errors: null,
      data: null,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const categoryController = {
  getCategories,
  getCategory,
  createCategory,
  deleteCategory,
  editCategory,
};
