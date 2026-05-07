import { Router } from "express";
import { body } from "express-validator";
import { createAppointment, listAppointments } from "../controllers/appointmentController.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";

export const appointmentRoutes = Router();

appointmentRoutes.use(authRequired);
appointmentRoutes.get("/", listAppointments);
appointmentRoutes.post(
  "/",
  [
    body("patientId").isUUID(),
    body("serviceDate").isISO8601(),
    body("amount").isFloat({ min: 0 }),
    body("paymentStatus").isIn(["paid", "pending", "installments"])
  ],
  validate,
  createAppointment
);
