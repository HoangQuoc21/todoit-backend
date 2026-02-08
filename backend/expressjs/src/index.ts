import "dotenv/config";
import express from "express";
import { middlewares } from "./utils";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get("/", middlewares.rootHandler);

app.use(middlewares.notFoundHandler);
app.use(middlewares.errorHandler);

app.listen(PORT, () => {
  console.log(`--> Todoit server is running on http://localhost:${PORT}`);
});
