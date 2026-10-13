import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

import authRoutes from "./routes/authRoutes.js";
import showRoutes from "./routes/showRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// CORS: only the configured frontend origin(s). Falls back to permissive mode in dev
// when FRONTEND_URL is not set. Accepts a comma separated list.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// Swagger Docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/users", userRoutes);

app.get("/ping", (req: Request, res: Response) => {
  res.json({ message: "¡Bora-Sync está en línea! 💜" });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({ message: err?.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
