import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { router } from "./routes/v1/index.js";

const app: Express = express();

// cors setup to pass specific endpoints only
app.use(
  cors({
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true, // allow cookies / auth headers
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello from auth service" });
});

console.log("hello from app");

// all routes

app.use("/api", router);



app.use(errorMiddleware);

export { app };