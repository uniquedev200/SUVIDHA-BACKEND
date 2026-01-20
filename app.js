import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRouter from "./routes/auth_route.js";
import billRouter from "./routes/bills_route.js";
import paymentsRouter from "./routes/payments_route.js";
import complaintsRouter from "./routes/complaints_route.js"
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/auth',authRouter);
app.use('/bills',billRouter);
app.use('/payments',paymentsRouter);
app.use('/complaints',complaintsRouter);
export default app;