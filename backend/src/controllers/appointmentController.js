import { query } from "../config/db.js";

export async function listAppointments(req, res) {
  const { rows } = await query(
    `select a.*, p.full_name as patient_name
       from appointments a
       join patients p on p.id = a.patient_id
      where a.user_id = $1
      order by a.service_date desc`,
    [req.user.sub]
  );
  return res.json({ data: rows });
}

export async function createAppointment(req, res) {
  const payload = req.body;
  const { rows } = await query(
    `insert into appointments (
      user_id, patient_id, service_date, service_type, specialty, description, amount,
      payment_method, payment_status, received_at, payer_cpf, payer_name, payer_is_patient,
      payer_relationship, include_carne_leao, include_receita_saude, include_irpf, requires_invoice, fiscal_notes
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    returning *`,
    [
      req.user.sub,
      payload.patientId,
      payload.serviceDate,
      payload.serviceType,
      payload.specialty,
      payload.description,
      payload.amount,
      payload.paymentMethod,
      payload.paymentStatus,
      payload.receivedAt || null,
      payload.payerCpf,
      payload.payerName,
      payload.payerIsPatient ?? true,
      payload.payerRelationship,
      payload.includeCarneLeao ?? true,
      payload.includeReceitaSaude ?? true,
      payload.includeIrpf ?? true,
      payload.requiresInvoice ?? false,
      payload.fiscalNotes
    ]
  );

  return res.status(201).json({ data: rows[0] });
}
