import cors from "cors";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./modules/auth/auth.router";
import userRouter from "./modules/user/user.router";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth", authRouter);
app.use("/users", userRouter);

export default app;
