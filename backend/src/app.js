import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { appointmentRoutes } from "./routes/appointmentRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { expenseRoutes } from "./routes/expenseRoutes.js";
import { patientRoutes } from "./routes/patientRoutes.js";
import { reportRoutes } from "./routes/reportRoutes.js";

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ status: "ok", app: "ATENDE+" }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno no servidor." });
});
