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
  userRouter,
} from "./src/features";

dotenv.config({ override: true, debug: true });
cloudinaryService.config();

const PORT = process.env.PORT!;
const DATABASE_NAME = process.env.DATABASE_NAME!;

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
app.use("/user", userRouter);
app.post("/upload-image", [
  middlewares.isAuthenticatedHandler,
  middlewares.imageUploadHandler,
  middlewares.uploadHandler,
]);
app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

try {
  await mongoose.connect(process.env.MONGODB_URI!, {
    dbName: DATABASE_NAME,
  });
  console.log(`--> Connected to MongoDB database: ${DATABASE_NAME}`);
  app.listen(PORT, () => {
    console.log(`--> Todoit server is running on http://localhost:${PORT}`);
    console.log(
      `--> API documentation available at http://localhost:${PORT}/api-docs`,
    );
  });
} catch (err) {
  console.error("--> Failed to connect to MongoDB", err);
}
