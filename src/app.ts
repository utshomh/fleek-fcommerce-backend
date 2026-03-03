import cors from "cors";
import path from "path";
import express from "express";

import authRouter from "./modules/auth/auth.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth", authRouter);

export default app;
