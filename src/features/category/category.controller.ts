import type { RequestHandler } from "express";
import {
  HttpError,
  type ApiResponse,
  type Category,
  type ListResponse,
} from "@/types";
import { status } from "http-status";
import { errorHelper, tokenHelper } from "@/helpers";
import { PAGINATION } from "@/constants";
import { CategoryModel } from "./category.model";
import { ObjectId } from "mongodb";
import { TodoModel } from "../todo";

const getCategories: RequestHandler = async (
  req: {
    query: { page?: number; size?: number };
  },
  res,
  next,
) => {
  errorHelper.handleValidationError(req as any, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req as any).userId;
    const page = req.query.page ?? PAGINATION.DEFAULT_PAGE;
    const size = req.query.size ?? PAGINATION.DEFAULT_SIZE;

    const totalItems = await CategoryModel.countDocuments({
      $or: [{ isPublic: true }, { creatorId: new ObjectId(userId) }],
    });
    const totalPages = Math.ceil(totalItems / size);
    const items = await CategoryModel.find({
      $or: [{ isPublic: true }, { creatorId: new ObjectId(userId) }],
    })
      .sort({ name: 1 })
      .skip(page * size)
      .limit(size);

    const response: ApiResponse<ListResponse<Category>> = {
      success: true,
      message: "Get categories successfully",
      errors: null,
      data: {
        meta: {
          page,
          size,
          totalItems,
          totalPages,
        },
        items: items.map((category) => ({
          id: category._id.toString(),
          name: category.name,
          isPublic: category.isPublic,
          isOwner: category.creatorId.toString() === userId,
        })),
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getCategory: RequestHandler<{ id: string }> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  const { id } = req.params;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const category = await CategoryModel.findById(id);

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
        isOwner: category.creatorId.toString() === userId,
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
  errorHelper.handleValidationError(req, next);

  const { name, isPublic } = req.body;
  const creatorId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const findingName = name.trim().toLowerCase();
    const existedCategory = await CategoryModel.findOne({
      name: { $regex: new RegExp(`^${findingName}$`, "i") },
      creatorId: new ObjectId(creatorId),
    });
    if (existedCategory) {
      throw new HttpError(status.BAD_REQUEST, "Category already exists", null);
    }

    const newCategory = new CategoryModel({
      name,
      isPublic,
      creatorId: new ObjectId(creatorId),
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
        isOwner: newCategory.creatorId.toString() === creatorId,
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
  errorHelper.handleValidationError(req, next);

  const { id } = req.params;
  const { name, isPublic } = req.body;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const category = await CategoryModel.findById(id);

    if (!category) {
      const error = new HttpError(status.NOT_FOUND, "Category not found", null);
      throw error;
    }

    if (category.creatorId.toString() !== userId) {
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
        isOwner: category.creatorId.toString() === userId,
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
  errorHelper.handleValidationError(req, next);

  const { id } = req.params;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const deletingCategory = await CategoryModel.findById(id);

    if (!deletingCategory) {
      const error = new HttpError(status.NOT_FOUND, "Category not found", null);
      throw error;
    }

    if (deletingCategory.creatorId.toString() !== userId) {
      const error = new HttpError(
        status.FORBIDDEN,
        "You do not have permission to delete this category",
        null,
      );
      throw error;
    }

    const todosUsingCategory = await TodoModel.find({
      categoryId: new ObjectId(id),
    }).limit(1);
    if (todosUsingCategory.length > 0) {
      const error = new HttpError(
        status.BAD_REQUEST,
        "Cannot delete category that is being used by todos",
        null,
      );
      throw error;
    }

    await CategoryModel.findByIdAndDelete(id);

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
