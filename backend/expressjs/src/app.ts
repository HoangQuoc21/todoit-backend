import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import { middlewares } from "./utils/middlewares";
import { categoryRouter } from "./features/category";
import { notificationRouter } from "./features/notification";
import { todoRouter } from "./features/todo";
import { userRouter } from "./features/user";

const PORT = process.env.PORT;

dotenv.config({ override: true });

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", middlewares.rootHandler);
app.use("/category", categoryRouter);
app.use("/notification", notificationRouter);
app.use("/todo", todoRouter);
app.use("/user", userRouter);
app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

await mongoose.connect(process.env.MONGODB_URI!);
console.log("--> Connected to MongoDB");
app.listen(PORT, () => {
  console.log(`--> Todoit server is running on http://localhost:${PORT}`);
});
