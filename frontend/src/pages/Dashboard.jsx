import { AlertCircle, BarChart3, CalendarDays, FileText, Plus, ReceiptText, TrendingUp, UserPlus, WalletCards } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "../components/Button.jsx";
import { isOverdue, money } from "../utils/formatters.js";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

export function Dashboard({ onNavigate, store }) {
  const today = new Date().toISOString().slice(0, 10);
  const appointments = store?.appointments || [];
  const expenses = store?.expenses || [];
  const appointmentsToday = appointments.filter((item) => item.date?.slice(0, 10) === today).length;
  const revenue = appointments.filter((item) => item.status === "Pago").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const pendingRevenue = appointments.filter((item) => item.status === "Pendente" || item.status === "Parcelado").reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const overdueExpenses = expenses.filter((item) => isOverdue(item.dueDate, item.status)).length;
  const unpaidAppointments = appointments.filter((item) => item.status !== "Pago" && item.status !== "Cancelado").length;
  const missingCpf = appointments.filter((item) => !item.payerCpf).length;
  const noReceiptExpenses = expenses.filter((item) => !item.attachment).length;
  const missingFiscalStatus = appointments.filter((item) => !item.fiscalStatus || item.fiscalStatus === "Pendente").length;
  const incompletePatients = (store?.patients || []).filter((item) => !item.cpf || !item.phone).length;
  const pendingPatients = [
    ...appointments.filter((item) => !item.payerCpf).map((item) => ({ name: `${item.patient}: falta CPF do pagador`, value: item.amount, target: "appointments" })),
    ...appointments.filter((item) => item.status !== "Pago" && item.status !== "Cancelado").map((item) => ({ name: `${item.patient}: pagamento ${item.status?.toLowerCase()}`, value: item.amount, target: "finance" })),
    ...expenses.filter((item) => !item.attachment).map((item) => ({ name: `${item.category}: sem comprovante`, value: item.amount, target: "expenses" }))
  ].slice(0, 8);
  const chartData = months.map((month) => ({ month, receitas: 0, despesas: 0 }));

  appointments.forEach((item) => {
    const date = item.date ? new Date(item.date) : null;
    if (date && !Number.isNaN(date.getTime()) && item.status === "Pago") {
      chartData[date.getMonth()] && (chartData[date.getMonth()].receitas += Number(item.amountNumber || 0));
    }
  });

  expenses.forEach((item) => {
    const date = item.date ? new Date(`${item.date}T00:00:00`) : null;
    if (date && !Number.isNaN(date.getTime())) {
      chartData[date.getMonth()] && (chartData[date.getMonth()].despesas += Number(item.amountNumber || 0));
    }
  });

  const summaryCards = [
    { label: "Atendimentos hoje", value: String(appointmentsToday), icon: CalendarDays },
    { label: "Receitas do mês", value: money(revenue), icon: WalletCards },
    { label: "Receitas pendentes", value: money(pendingRevenue), icon: AlertCircle },
    { label: "Despesas do mês", value: money(expenseTotal), icon: BarChart3 },
    { label: "Resultado mensal", value: money(revenue - expenseTotal), icon: TrendingUp },
    { label: "Contas vencidas", value: String(overdueExpenses), icon: ReceiptText },
    { label: "Sem pagamento", value: String(unpaidAppointments), icon: CalendarDays },
    { label: "Sem CPF/Doc.", value: String(missingCpf + noReceiptExpenses + missingFiscalStatus + incompletePatients), icon: AlertCircle }
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-greeting">
        <h1>Olá, Dra. Jennyff</h1>
        <p>Aqui está o resumo do seu consultório hoje.</p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card) => (
          <button className="summary-card" key={card.label} onClick={() => onNavigate(card.label.includes("Despesas") ? "expenses" : "finance")}>
            <card.icon size={24} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </button>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <article className="finance-chart-card">
          <h2>Receitas x Despesas</h2>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={chartData} margin={{ top: 30, right: 18, left: 8, bottom: 12 }}>
              <Tooltip
                formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Line type="monotone" dataKey="receitas" stroke="#18b889" strokeWidth={4} dot={{ r: 4, fill: "#18b889", strokeWidth: 0 }} />
              <Line type="monotone" dataKey="despesas" stroke="#ff4d59" strokeWidth={4} dot={{ r: 4, fill: "#ff4d59", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          {appointments.length === 0 && expenses.length === 0 && (
            <p className="empty-chart">Cadastre atendimentos e despesas para visualizar o gráfico.</p>
          )}
        </article>

        <article className="pending-panel">
          <h2>Pendências</h2>
          <div className="pending-list">
            {pendingPatients.length === 0 ? (
              <p className="empty-state">Nenhuma pendência cadastrada.</p>
            ) : pendingPatients.map((patient) => (
              <button key={patient.name} onClick={() => onNavigate(patient.target)}>
                <span>{patient.name}</span>
                <strong>{patient.value}</strong>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="post-login-actions">
        <Button onClick={() => onNavigate("appointments")}><Plus size={17} /> Novo atendimento</Button>
        <Button variant="soft" onClick={() => onNavigate("patients")}><UserPlus size={17} /> Novo paciente</Button>
        <Button variant="soft" onClick={() => onNavigate("expenses")}><ReceiptText size={17} /> Nova despesa</Button>
        <Button variant="dark" onClick={() => onNavigate("reports")}><FileText size={17} /> Relatórios</Button>
      </div>
    </section>
  );
}
