// src/index.ts
import path from "path";
import "dotenv/config";
import express, { Application, Request, Response } from "express";
import { MulterError } from "multer";
import bodyParser from "body-parser";
import cors from "cors";
import adminUserRoutes from "./routes/admin.user.route";
import authRoutes from "./routes/auth.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";
import paymentRoutes from "./routes/payment.route";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

const app: Application = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://10.1.15.113:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Mobile apps may not send Origin header
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminUserRoutes);

app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use((err: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  if (err instanceof MulterError) {
    const isTooLarge = err.code === "LIMIT_FILE_SIZE";
    return res.status(isTooLarge ? 413 : 400).json({
      success: false,
      message: isTooLarge ? "Image too large. Max size is 20MB." : err.message,
    });
  }

  if (err instanceof Error) {
    return res.status(500).json({ success: false, message: err.message });
  }

  return res.status(500).json({ success: false, message: "Internal Server Error" });
});

async function startServer() {
  try {
    await connectDatabase();

    const HOST = "0.0.0.0";

    app.listen(Number(PORT), HOST, () => {
      console.log(`Server running on: http://${HOST}:${PORT}`);
      console.log(`From phone use: http://10.1.15.113:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
