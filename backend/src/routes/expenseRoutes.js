import { Router } from "express";
import { body } from "express-validator";
import { createExpense, listExpenses } from "../controllers/expenseController.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

export const expenseRoutes = Router();

expenseRoutes.use(authRequired);
expenseRoutes.get("/", listExpenses);
expenseRoutes.post(
  "/",
  [body("expenseDate").isISO8601(), body("category").notEmpty(), body("amount").isFloat({ min: 0 })],
  validate,
  createExpense
);
