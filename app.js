import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRouter from "./routes/auth_route.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth',authRouter);
export default app;