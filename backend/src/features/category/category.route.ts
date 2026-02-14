import express from "express";
import { categoryController } from "./category.controller";
import { middlewares } from "../../utils";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  middlewares.isAuthenticatedHandler,
  categoryController.getCategories,
);

export { categoryRouter };
