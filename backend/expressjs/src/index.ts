import "dotenv/config";
import express from "express";
import { middlewares } from "./utils";
import {
  categoryRouter,
  notificationRouter,
  todoRouter,
  userRouter,
} from "./routes";

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
