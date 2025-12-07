import express from "express";
import type { Application, Request, Response } from "express";
import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/v1/auth", authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

export default app;
