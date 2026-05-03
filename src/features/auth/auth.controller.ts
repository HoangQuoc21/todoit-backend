import type { RequestHandler } from "express";
import { status } from "http-status";
import { compare } from "bcrypt";
import { UserModel } from "../user";
import { HttpError, type ApiResponse, type User } from "@/types";
import { errorHelper, passwordHelper, tokenHelper } from "@/helpers";

const signUp: RequestHandler<
  {},
  {},
  { email: string; password: string; name: string }
> = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  const { email, password, name } = req.body;

  try {
    const hashedPassword = await passwordHelper.hashPassword(password);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
      pushToken: null,
      accessToken: null,
    });

    const accessToken = tokenHelper.generateToken(newUser._id.toString());
    newUser.accessToken = accessToken;

    if (req.file) {
      newUser.imageUrl = req.file.path;
    }

    await newUser.save();

    const response: ApiResponse<User> = {
      success: true,
      message: "User signed up successfully",
      errors: null,
      data: {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        imageUrl: newUser.imageUrl ?? null,
        accessToken: newUser.accessToken,
        pushToken: null,
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
  if (errorHelper.handleValidationError(req, next)) return;

  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      const error = new HttpError(
        status.NOT_FOUND,
        "A user with this email could not be found",
        null,
      );
      throw error;
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      const error = new HttpError(
        status.UNAUTHORIZED,
        "Incorrect password",
        null,
      );
      throw error;
    }

    const userId = user._id.toString();
    const accessToken = tokenHelper.generateToken(userId);

    user.accessToken = accessToken;
    await user.save();

    const response: ApiResponse<User> = {
      success: true,
      message: "User signed in successfully",
      errors: null,
      data: {
        id: userId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl ?? null,
        accessToken: user.accessToken,
        pushToken: user.pushToken ?? null,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const signOut: RequestHandler = async (req, res, next) => {
  if (errorHelper.handleValidationError(req, next)) return;

  try {
    const userId = tokenHelper.parseTokenFromRequestHeader(req).userId;
    await UserModel.findByIdAndUpdate(userId, {
      accessToken: null,
      pushToken: null,
    });

    const response: ApiResponse = {
      success: true,
      message: "User signed out successfully",
      errors: null,
      data: null,
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const authController = {
  signUp,
  signIn,
  signOut,
};
