import "dotenv/config";
import express from "express";
import { middlewares } from "./utils/middlewares";
import { categoryRouter } from "./features/category";
import { notificationRouter } from "./features/notification";
import { todoRouter } from "./features/todo";
import { userRouter } from "./features/user";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get("/", middlewares.rootHandler);

app.use("/category", categoryRouter);
app.use("/notification", notificationRouter);
app.use("/todo", todoRouter);
app.use("/user", userRouter);

app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

app.listen(PORT, () => {
  console.log(`--> Todoit server is running on http://localhost:${PORT}`);
});
