import dotenv from "dotenv";
dotenv.config(); // MUST be first

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

import path from "path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// -------------------------
// Initialize DB & App
// -------------------------
connectDB();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// Directory Setup (ESM)
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// Middleware
// -------------------------
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://authentication-app-jyr8.onrender.com", // frontend dev server
    credentials: true,
  })
);

// Security & Performance (only in production)
if (process.env.NODE_ENV === "production") {
  app.use(helmet());       // security headers
  app.use(compression());  // gzip compression
  app.use(morgan("combined")); // logging
}

// -------------------------
// API Routes (must come first)
// -------------------------
app.use("/api/auth", authRoutes);

// -------------------------
// Serve Frontend in Production
// -------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  // SPA fallback (must be after API routes)
  app.get("*", (_, res) =>
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"))
  );
}

// -------------------------
// 404 Handler
// -------------------------
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// -------------------------
// Global Error Middleware
// -------------------------
app.use(errorMiddleware);

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
