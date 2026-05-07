import { query } from "../config/db.js";

export async function dashboard(req, res) {
  const { rows } = await query(
    `with month_appointments as (
       select * from appointments
        where user_id = $1 and date_trunc('month', service_date) = date_trunc('month', now())
     ),
     month_expenses as (
       select * from expenses
        where user_id = $1 and date_trunc('month', expense_date) = date_trunc('month', now())
     )
     select
       (select count(*)::int from month_appointments) as appointments_month,
       coalesce((select sum(amount) from month_appointments where payment_status = 'paid'), 0) as revenue_month,
       coalesce((select sum(amount) from month_expenses), 0) as expenses_month,
       coalesce((select sum(amount) from month_appointments where payment_status in ('pending', 'installments')), 0) as pending_amount`,
    [req.user.sub]
  );

  return res.json({ data: rows[0] });
}

export async function fiscalSummary(req, res) {
  const { rows } = await query(
    `select
       p.full_name as patient_name,
       a.payer_cpf,
       sum(a.amount) as total_received,
       bool_or(a.include_carne_leao) as carne_leao,
       bool_or(a.include_receita_saude) as receita_saude,
       bool_or(a.include_irpf) as irpf,
       bool_or(a.requires_invoice) as invoice
     from appointments a
     join patients p on p.id = a.patient_id
     where a.user_id = $1 and a.payment_status = 'paid'
     group by p.full_name, a.payer_cpf
     order by total_received desc`,
    [req.user.sub]
  );

  return res.json({ data: rows });
}
