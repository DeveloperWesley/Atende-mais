import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  [
    body("fullName").trim().isLength({ min: 3 }),
    body("document").trim().isLength({ min: 11 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
    body("profileType").isIn(["individual", "company"])
  ],
  validate,
  register
);

authRoutes.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  login
);

authRoutes.get("/me", authRequired, me);
