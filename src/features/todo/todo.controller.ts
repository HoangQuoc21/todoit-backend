import { ObjectId } from "mongodb";
import type { RequestHandler } from "express";
import {
  HttpError,
  type ApiResponse,
  type ListResponse,
  type Todo,
} from "@/types";
import { status } from "http-status";
import { errorHelper, FORM_FIELDS, PAGINATION, tokenHelper } from "@/utils";
import { TodoModel } from "./todo.model";
import { CategoryModel } from "../category/category.model";
import { cloudinaryService } from "@/services/cloudinary";

const createTodo: RequestHandler<
  {},
  {},
  {
    title: string;
    content?: string;
    dueDate?: string;
    categoryId?: string;
  }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const { title, content, dueDate, categoryId } = req.body;
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    let image = null;
    if (req.file) {
      image = req.file.path;
    }

    const newTodo = await TodoModel.create({
      title,
      content: content,
      image,
      dueDate: dueDate ? parseInt(dueDate) : null,
      creatorId: new ObjectId(userId),
      categoryId: categoryId ? new ObjectId(categoryId) : null,
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
        image: newTodo.image || null,
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
    const page = req.query.page ?? PAGINATION.DEFAULT_PAGE;
    const size = req.query.size ?? PAGINATION.DEFAULT_SIZE;

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
            image: todo.image || null,
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
        image: todo.image || null,
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
    if (deletedTodo.image) {
      deleteImageMessage = (
        await cloudinaryService.deleteImage(deletedTodo.image)
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
    title?: string;
    content?: string;
    dueDate?: string;
    categoryId?: string;
    image?: string;
  }
> = async (req, res, next) => {
  errorHelper.handleValidationError(req, next);

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;
    const { title, content, dueDate, categoryId } = req.body;
    let image = null;
    if (req.file) {
      image = req.file.path;
    }

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

    if (title !== undefined) updatedTodo.title = title;
    if (content !== undefined) updatedTodo.content = content;
    if (dueDate !== undefined)
      updatedTodo.dueDate = dueDate ? parseInt(dueDate) : null;
    if (categoryId !== undefined)
      updatedTodo.categoryId = categoryId ? new ObjectId(categoryId) : null;
    if (image !== undefined) updatedTodo.image = image;
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
        image: updatedTodo.image || null,
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
        image: updatedTodo.image || null,
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
