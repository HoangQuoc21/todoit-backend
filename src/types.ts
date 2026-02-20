import { type ValidationError } from "express-validator";

type HttpErrorData = ValidationError[] | null;

class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data: HttpErrorData,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

type ApiResponse<T = null> = {
  success: boolean;
  message?: string;
  errors: HttpErrorData;
  data: T;
};

type User = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  accessToken: string | null;
};

type Category = {
  id: string;
  name: string;
  isPublic: boolean;
  isOwner: boolean;
};

type Todo = {
  id: string;
  title: string;
  content: string | null;
  dueDate: number | null;
  isCompleted: boolean;
  category: Category | null;
};

type Notification = {
  id: string;
  title: string;
  content: string | null;
  isRead: boolean;
  sentAt: number;
};

type ListResponse<T> = {
  meta: {
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
  };
  items: T[];
};

type ThirdPartyResponse = {
  success: boolean;
  message: string;
};

export {
  HttpError,
  type ApiResponse,
  type User,
  type Category,
  type Todo,
  type Notification,
  type ListResponse,
  type ThirdPartyResponse,
};
