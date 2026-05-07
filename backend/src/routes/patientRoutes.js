import { Router } from "express";
import { body } from "express-validator";
import { createPatient, deletePatient, listPatients, updatePatient } from "../controllers/patientController.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

export const patientRoutes = Router();

patientRoutes.use(authRequired);
patientRoutes.get("/", listPatients);
patientRoutes.post("/", [body("fullName").trim().isLength({ min: 3 }), body("cpf").optional().trim()], validate, createPatient);
patientRoutes.put("/:id", [body("fullName").trim().isLength({ min: 3 })], validate, updatePatient);
patientRoutes.delete("/:id", deletePatient);
