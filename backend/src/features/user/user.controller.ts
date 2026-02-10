import type { RequestHandler } from "express";
import { status } from "http-status";
import { validationResult } from "express-validator";
import { hash } from "bcrypt";
import { userModel } from "./user.model";
import type { ApiResponse } from "../../types";
import { HttpError } from "../../types";
import { errorHelper } from "../../utils";

const signUpController: RequestHandler = async (
  req: {
    body: { email: string; password: string; name: string };
  },
  res,
  next,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.UNPROCESSABLE_ENTITY,
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

const signInController: RequestHandler = (req, res, next) => {
  const response: ApiResponse<null> = {
    success: true,
    message: "User signed in successfully",
    data: null,
  };

  res.status(status.OK).json(response);
};

export const userController = {
  signUpController,
  signInController,
};
