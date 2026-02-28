import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authMiddleware from "./middlewares/auth.middleware.js";
import ApiError from "./lib/ApiError.js";
import queryRouter from "./routes/query.routes.js"

const app = express();

// middlewares
app.set("trust proxy", true);
app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// auth middleware
app.use("/api/v1/query", authMiddleware);

// routes
app.use("/api/v1/query", queryRouter);

// error handling
// 404
app.use((req, _, next) => {
  const error = new ApiError(404, `Route not found ${req.path}`);
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  // err is ApiError normalized in asyncHandler
  res.status(err.statusCode || 500).json(err);
});

export default app;
