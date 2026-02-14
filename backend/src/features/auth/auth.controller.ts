import type { RequestHandler } from "express";
import { status } from "http-status";
import { validationResult } from "express-validator";
import { hash, compare } from "bcrypt";
import { userModel } from "../user/user.model";
import { HttpError } from "../../types/http-error";
import { errorHelper } from "../../utils/helpers/error-helper";
import type { ApiResponse } from "../../types/api-response";
import { FORM_FIELDS } from "../../utils/constants/form-field";
import { tokenHelper } from "../../utils/helpers/token-helper";

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

    const response: ApiResponse = {
      success: true,
      message: "User signed up successfully",
      data: null,
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

    const userId = user._id.toString();
    const accessToken = tokenHelper.generateToken(userId);

    user.accessToken = accessToken;
    await user.save();

    const response: ApiResponse<{
      [FORM_FIELDS.USERID]: string;
      [FORM_FIELDS.ACCESS_TOKEN]: string;
    }> = {
      success: true,
      message: "User signed in successfully",
      data: {
        [FORM_FIELDS.USERID]: userId,
        [FORM_FIELDS.ACCESS_TOKEN]: accessToken,
      },
    };

    res.status(status.OK).json(response);
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

const signOut: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const returnError = new HttpError(
      status.BAD_REQUEST,
      "Validation failed",
      errors.array(),
    );
    return next(errorHelper.handleServerError(returnError));
  }

  const accessToken = tokenHelper.getTokenFromRequestHeader(req);

  try {
    const userId = tokenHelper.parseToken(accessToken).userId;
    await userModel.findByIdAndUpdate(userId, { accessToken: null });
    res.status(status.OK).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (err) {
    next(errorHelper.handleServerError(err as HttpError));
  }
};

export const authController = {
  signUp,
  signIn,
  signOut,
};
