import { query } from "../config/db.js";

export async function listPatients(req, res) {
  const { rows } = await query(
    "select * from patients where user_id = $1 order by full_name asc",
    [req.user.sub]
  );
  return res.json({ data: rows });
}

export async function createPatient(req, res) {
  const { fullName, cpf, birthDate, phone, email, address, notes, financialResponsible } = req.body;
  const { rows } = await query(
    `insert into patients (user_id, full_name, cpf, birth_date, phone, email, address, notes, financial_responsible)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning *`,
    [req.user.sub, fullName, cpf, birthDate || null, phone, email, address, notes, financialResponsible]
  );

  return res.status(201).json({ data: rows[0] });
}

export async function updatePatient(req, res) {
  const { id } = req.params;
  const { fullName, cpf, birthDate, phone, email, address, notes, financialResponsible } = req.body;
  const { rows } = await query(
    `update patients
       set full_name = $1, cpf = $2, birth_date = $3, phone = $4, email = $5,
           address = $6, notes = $7, financial_responsible = $8, updated_at = now()
     where id = $9 and user_id = $10
     returning *`,
    [fullName, cpf, birthDate || null, phone, email, address, notes, financialResponsible, id, req.user.sub]
  );

  if (!rows[0]) return res.status(404).json({ message: "Paciente não encontrado." });
  return res.json({ data: rows[0] });
}

export async function deletePatient(req, res) {
  const { rowCount } = await query("delete from patients where id = $1 and user_id = $2", [req.params.id, req.user.sub]);
  if (!rowCount) return res.status(404).json({ message: "Paciente não encontrado." });
  return res.status(204).send();
}
