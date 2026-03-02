import cors from "cors";
import express from "express";

import authRouter from "./modules/auth/auth.router";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

export default app;
