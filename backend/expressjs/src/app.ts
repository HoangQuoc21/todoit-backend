import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import { middlewares } from "./utils";
import {
  categoryRouter,
  notificationRouter,
  todoRouter,
  userRouter,
} from "./features";

const PORT = process.env.PORT;
const DATABASE_NAME = "todoit_db";

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

await mongoose.connect(process.env.MONGODB_URI!, {
  dbName: DATABASE_NAME,
});
console.log(`--> Connected to MongoDB database: ${DATABASE_NAME}`);
app.listen(PORT, () => {
  console.log(`--> Todoit server is running on http://localhost:${PORT}`);
});
