import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerService, cloudinaryService } from "./src/services";
import { middlewares } from "./src/middlewares";
import {
  authRouter,
  categoryRouter,
  notificationRouter,
  todoRouter,
  uploadRouter,
  userRouter,
} from "./src/features";

dotenv.config({ override: true, debug: true });
cloudinaryService.config();

const BE_PORT = process.env.BE_PORT;
const MONGO_HOST = process.env.MONGO_HOST || "127.0.0.1";
const MONGODB_URI = `mongodb://${MONGO_HOST}:27017`;
const DATABASE_NAME = process.env.MONGO_INITDB_DATABASE;

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", middlewares.rootHandler);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerService.specification),
);
app.use("/auth", authRouter);
app.use("/category", categoryRouter);
app.use("/notification", notificationRouter);
app.use("/todo", todoRouter);
app.use("/upload", uploadRouter);
app.use("/user", userRouter);
app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

try {
  await mongoose.connect(MONGODB_URI, {
    dbName: DATABASE_NAME,
    authSource: "admin",
    auth: {
      username: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD,
    },
  });
  console.log(`--> Connected to MongoDB database: ${DATABASE_NAME}`);
  app.listen(BE_PORT, () => {
    console.log(`--> Todoit server is running on http://localhost:${BE_PORT}`);
    console.log(
      `--> API documentation available at http://localhost:${BE_PORT}/api-docs`,
    );
  });
} catch (err) {
  console.error("--> Failed to connect to MongoDB", err);
}
