import { Router } from "express";
import { dashboard, fiscalSummary } from "../controllers/reportController.js";
import { authRequired } from "../middlewares/auth.js";

export const reportRoutes = Router();

reportRoutes.use(authRequired);
reportRoutes.get("/dashboard", dashboard);
reportRoutes.get("/fiscal-summary", fiscalSummary);
