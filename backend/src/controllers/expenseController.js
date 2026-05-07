import { query } from "../config/db.js";

export async function listExpenses(req, res) {
  const { rows } = await query(
    "select * from expenses where user_id = $1 order by expense_date desc",
    [req.user.sub]
  );
  return res.json({ data: rows });
}

export async function createExpense(req, res) {
  const { expenseDate, category, amount, paymentMethod, attachmentUrl, notes, isDeductible } = req.body;
  const { rows } = await query(
    `insert into expenses (user_id, expense_date, category, amount, payment_method, attachment_url, notes, is_deductible)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning *`,
    [req.user.sub, expenseDate, category, amount, paymentMethod, attachmentUrl, notes, isDeductible ?? false]
  );
  return res.status(201).json({ data: rows[0] });
}
