import { ObjectId } from "mongodb";
import type { RequestHandler } from "express";
import {
  HttpError,
  type ApiResponse,
  type ListResponse,
  type Todo,
} from "@/types";
import { status } from "http-status";
import { errorHelper, tokenHelper } from "@/helpers";
import { FORM_FIELDS, PAGINATION } from "@/constants";
import { TodoModel } from "./todo.model";
import { CategoryModel } from "../category";
import { cloudinaryService } from "@/services/cloudinary";

const createTodo: RequestHandler<
  {},
  {},
  {
    title: string;
    content?: string;
    imageUrl?: string;
    dueDate?: number;
    categoryId?: string;
  }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const { title, content, imageUrl, dueDate, categoryId } = req.body;
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

    const newTodo = await TodoModel.create({
      title,
      content: content ?? null,
      imageUrl,
      dueDate: dueDate ?? null,
      categoryId: categoryId ? new ObjectId(categoryId) : null,
      creatorId: new ObjectId(userId),
    });

    if (categoryId) {
      await newTodo.populate(FORM_FIELDS.CATEGORY_ID);
    }

    const populatedCategory = newTodo.categoryId as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo created successfully",
      errors: null,
      data: {
        id: newTodo._id.toString(),
        title: newTodo.title,
        content: newTodo.content || null,
        imageUrl: newTodo.imageUrl || null,
        dueDate: newTodo.dueDate || null,
        isCompleted: newTodo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.creatorId.toString() === userId,
            }
          : null,
      },
    };

    res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getTodos: RequestHandler = async (
  req: {
    query: { page?: number; size?: number };
  },
  res,
  next,
) => {
  errorHelper.handleValidationError(req as any, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req as any).userId;
    const page = req.query.page ?? Number(PAGINATION.DEFAULT_PAGE);
    const size = req.query.size ?? Number(PAGINATION.DEFAULT_SIZE);

    const totalItems = await TodoModel.countDocuments({
      creatorId: new ObjectId(userId),
    });
    const totalPages = Math.ceil(totalItems / size);
    const items = await TodoModel.find({
      creatorId: new ObjectId(userId),
    }).populate(FORM_FIELDS.CATEGORY_ID);

    const response: ApiResponse<ListResponse<Todo>> = {
      success: true,
      message: "Todos retrieved successfully",
      errors: null,
      data: {
        meta: {
          page,
          size,
          totalItems,
          totalPages,
        },
        items: items.map((todo) => {
          const populatedCategory = todo.categoryId as any;
          return {
            id: todo._id.toString(),
            title: todo.title,
            content: todo.content || null,
            imageUrl: todo.imageUrl || null,
            dueDate: todo.dueDate || null,
            isCompleted: todo.isCompleted,
            category: populatedCategory
              ? {
                  id: populatedCategory._id.toString(),
                  name: populatedCategory.name,
                  isPublic: populatedCategory.isPublic,
                  isOwner: populatedCategory.creatorId.toString() === userId,
                }
              : null,
          };
        }),
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getTodo: RequestHandler<{ id: string }> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;

    const todo = await TodoModel.findOne({
      _id: new ObjectId(todoId),
      creatorId: new ObjectId(userId),
    }).populate(FORM_FIELDS.CATEGORY_ID);

    if (!todo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    const populatedCategory = todo.categoryId as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo retrieved successfully",
      errors: null,
      data: {
        id: todo._id.toString(),
        title: todo.title,
        content: todo.content || null,
        imageUrl: todo.imageUrl || null,
        dueDate: todo.dueDate || null,
        isCompleted: todo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.creatorId.toString() === userId,
            }
          : null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const deleteTodo: RequestHandler<{ id: string }> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;

    const deletedTodo = await TodoModel.findOne({
      _id: new ObjectId(todoId),
      creatorId: new ObjectId(userId),
    });

    if (!deletedTodo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    let deleteImageMessage = "";
    if (deletedTodo.imageUrl) {
      deleteImageMessage = (
        await cloudinaryService.deleteImage(deletedTodo.imageUrl)
      ).message;
    }
    await TodoModel.deleteOne({ _id: new ObjectId(todoId) });

    const response: ApiResponse<null> = {
      success: true,
      message: "Todo deleted successfully" + deleteImageMessage,
      errors: null,
      data: null,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const editTodo: RequestHandler<
  { id: string },
  {},
  {
    title: string;
    content?: string;
    imageUrl?: string;
    dueDate?: number;
    categoryId?: string;
  }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;
    const { title, content, imageUrl, dueDate, categoryId } = req.body;

    if (categoryId) {
      const categoryExists = await CategoryModel.findById(categoryId);
      if (!categoryExists) {
        const returnError = new HttpError(
          status.BAD_REQUEST,
          "Category with the provided ID does not exist",
          null,
        );
        return next(errorHelper.handleServerError(returnError));
      }
    }

    const updatedTodo = await TodoModel.findById(todoId);

    if (!updatedTodo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    if (updatedTodo.creatorId.toString() !== userId) {
      const returnError = new HttpError(
        status.FORBIDDEN,
        "You do not have permission to edit this todo",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    updatedTodo.title = title;
    if (content) updatedTodo.content = content ?? null;
    if (imageUrl) {
      if (imageUrl !== updatedTodo.imageUrl) {
        const oldImageUrl = updatedTodo.imageUrl;
        updatedTodo.imageUrl = imageUrl;
        if (oldImageUrl) {
          // delete in background
          cloudinaryService
            .deleteImage(oldImageUrl)
            .then((result) => {
              console.log(
                "\b --> todo.controller.ts:288 --> editTodo --> result:",
                result,
              );
            })
            .catch((err) => {
              console.error(
                "\b --> todo.controller.ts:290 --> editTodo --> error:",
                err,
              );
            });
        }
      }
    } else {
      updatedTodo.imageUrl = null;
    }
    if (dueDate) updatedTodo.dueDate = dueDate ?? null;
    if (categoryId)
      updatedTodo.categoryId = categoryId ? new ObjectId(categoryId) : null;

    await updatedTodo.save();

    if (updatedTodo.categoryId) {
      await updatedTodo.populate(FORM_FIELDS.CATEGORY_ID);
    }

    const populatedCategory = updatedTodo.categoryId as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo updated successfully",
      errors: null,
      data: {
        id: updatedTodo._id.toString(),
        title: updatedTodo.title,
        content: updatedTodo.content || null,
        imageUrl: updatedTodo.imageUrl || null,
        dueDate: updatedTodo.dueDate || null,
        isCompleted: updatedTodo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.creatorId.toString() === userId,
            }
          : null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const toggleCompleted: RequestHandler<
  { id: string },
  {},
  { isCompleted: boolean }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;
    const { isCompleted } = req.body;

    const todo = await TodoModel.findOne({
      _id: new ObjectId(todoId),
      creatorId: new ObjectId(userId),
    });

    if (!todo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    todo.isCompleted = isCompleted;
    const updatedTodo = await todo.save();
    await updatedTodo.populate(FORM_FIELDS.CATEGORY_ID);

    const populatedCategory = updatedTodo.categoryId as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo completion status updated successfully",
      errors: null,
      data: {
        id: updatedTodo._id.toString(),
        title: updatedTodo.title,
        content: updatedTodo.content || null,
        imageUrl: updatedTodo.imageUrl || null,
        dueDate: updatedTodo.dueDate || null,
        isCompleted: updatedTodo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.creatorId.toString() === userId,
            }
          : null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const todoController = {
  createTodo,
  getTodos,
  getTodo,
  deleteTodo,
  editTodo,
  toggleCompleted,
};
