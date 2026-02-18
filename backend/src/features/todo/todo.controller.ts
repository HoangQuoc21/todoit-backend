import { ObjectId } from "mongodb";
import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { HttpError, type ApiResponse, type Todo } from "../../types";
import status from "http-status";
import { errorHelper, tokenHelper } from "../../utils";
import { todoModel } from "./todo.model";
import { categoryModel } from "../category/category.model";

const createTodo: RequestHandler<
  {},
  {},
  {
    title: string;
    description?: string;
    dueDate?: string;
    categoryId?: string;
  }
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

  const { title, description, dueDate, categoryId } = req.body;
  const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;

  try {
    const newTodo = await todoModel.create({
      title,
      description,
      dueDate: dueDate ? parseInt(dueDate) : null,
      category: categoryId ? new ObjectId(categoryId) : null,
      createdBy: new ObjectId(userId),
    });

    if (categoryId) {
      await newTodo.populate("category");
    }

    const populatedCategory = newTodo.category as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo created successfully",
      errors: null,
      data: {
        id: newTodo._id.toString(),
        title: newTodo.title,
        description: newTodo.description || null,
        dueDate: newTodo.dueDate || null,
        isCompleted: newTodo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.createdBy.toString() === userId,
            }
          : null,
      },
    };

    res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getTodos: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todos = await todoModel
      .find({ createdBy: new ObjectId(userId) })
      .populate("category");

    const response: ApiResponse<Todo[]> = {
      success: true,
      message: "Todos retrieved successfully",
      errors: null,
      data: todos.map((todo) => {
        const populatedCategory = todo.category as any;
        return {
          id: todo._id.toString(),
          title: todo.title,
          description: todo.description || null,
          dueDate: todo.dueDate || null,
          isCompleted: todo.isCompleted,
          category: populatedCategory
            ? {
                id: populatedCategory._id.toString(),
                name: populatedCategory.name,
                isPublic: populatedCategory.isPublic,
                isOwner: populatedCategory.createdBy.toString() === userId,
              }
            : null,
        };
      }),
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getTodo: RequestHandler<{ id: string }> = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;

    const todo = await todoModel
      .findOne({ _id: new ObjectId(todoId), createdBy: new ObjectId(userId) })
      .populate("category");

    if (!todo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    const populatedCategory = todo.category as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo retrieved successfully",
      errors: null,
      data: {
        id: todo._id.toString(),
        title: todo.title,
        description: todo.description || null,
        dueDate: todo.dueDate || null,
        isCompleted: todo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.createdBy.toString() === userId,
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;

    const deletedTodo = await todoModel.findOneAndDelete({
      _id: new ObjectId(todoId),
      createdBy: new ObjectId(userId),
    });

    if (!deletedTodo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    const response: ApiResponse<null> = {
      success: true,
      message: "Todo deleted successfully",
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
    description?: string;
    dueDate?: string;
    isCompleted?: boolean;
    categoryId?: string;
  }
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

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    const todoId = req.params.id;
    const { title, description, dueDate, isCompleted, categoryId } = req.body;

    if (categoryId) {
      const categoryExists = await categoryModel.findById(categoryId);
      if (!categoryExists) {
        const returnError = new HttpError(
          status.BAD_REQUEST,
          "Category with the provided ID does not exist",
          null,
        );
        return next(errorHelper.handleServerError(returnError));
      }
    }

    const updatedTodo = await todoModel.findById(todoId);

    if (!updatedTodo) {
      const returnError = new HttpError(
        status.NOT_FOUND,
        "Todo not found",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    if (updatedTodo.createdBy.toString() !== userId) {
      const returnError = new HttpError(
        status.FORBIDDEN,
        "You do not have permission to edit this todo",
        null,
      );
      return next(errorHelper.handleServerError(returnError));
    }

    if (title !== undefined) updatedTodo.title = title;
    if (description !== undefined) updatedTodo.description = description;
    if (dueDate !== undefined)
      updatedTodo.dueDate = dueDate ? parseInt(dueDate) : null;
    if (isCompleted !== undefined) updatedTodo.isCompleted = isCompleted;
    if (categoryId !== undefined)
      updatedTodo.category = categoryId ? new ObjectId(categoryId) : null;

    await updatedTodo.save();

    if (updatedTodo.category) {
      await updatedTodo.populate("category");
    }

    const populatedCategory = updatedTodo.category as any;

    const response: ApiResponse<Todo> = {
      success: true,
      message: "Todo updated successfully",
      errors: null,
      data: {
        id: updatedTodo._id.toString(),
        title: updatedTodo.title,
        description: updatedTodo.description || null,
        dueDate: updatedTodo.dueDate || null,
        isCompleted: updatedTodo.isCompleted,
        category: populatedCategory
          ? {
              id: populatedCategory._id.toString(),
              name: populatedCategory.name,
              isPublic: populatedCategory.isPublic,
              isOwner: populatedCategory.createdBy.toString() === userId,
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
};
