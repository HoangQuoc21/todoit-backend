import type { RequestHandler } from "express";
import { status } from "http-status";
import { validationResult } from "express-validator";
import { hash, compare } from "bcrypt";
import { userModel } from "./user.model";
import type { ApiResponse } from "../../types";
import { HttpError } from "../../types";
import { errorHelper } from "../../utils";
import jwt from "jsonwebtoken";

const signUp: RequestHandler<
  {},
  {},
  { email: string; password: string; name: string }
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

  const { email, password, name } = req.body;

  try {
    const hashedPassword = await hash(
      password,
      Number(process.env.HASHING_SALT!),
    );

    const newUser = new userModel({
      email,
      password: hashedPassword,
      name,
    });
    await newUser.save();

    const response: ApiResponse<{
      userId: string;
    }> = {
      success: true,
      message: "User signed up successfully",
      data: {
        userId: newUser._id.toString(),
      },
    };

    res.status(status.CREATED).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const signIn: RequestHandler<
  {},
  {},
  { email: string; password: string }
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

  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "User A user with this email could not be found",
        [],
      );
      throw error;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      const error = new HttpError(
        status.UNAUTHORIZED,
        "Incorrect password",
        [],
      );
      throw error;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "1h" },
    );

    const response: ApiResponse<{
      userId: string;
      email: string;
      name: string;
      token: string;
    }> = {
      success: true,
      message: "User signed in successfully",
      data: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        token,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const getUser: RequestHandler<{}, {}, {}, { userId: string }> = async (
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

  const { userId } = req.query;

  try {
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "User A user with this ID could not be found",
        [],
      );
      throw error;
    }

    const response: ApiResponse<{
      userId: string;
      email: string;
      name: string;
    }> = {
      success: true,
      message: "Get user successfully",
      data: {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const userController = {
  signUp,
  signIn,
  getUser,
};
