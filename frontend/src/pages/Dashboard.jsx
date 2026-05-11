import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, FileText, Plus, ReceiptText, TrendingUp, UserPlus, WalletCards } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Button } from "../components/Button.jsx";
import { FinancialTimeline } from "../components/FinancialTimeline.jsx";
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

  const result = revenue - expenseTotal;
  const summaryCards = [
    { label: "Atendimentos hoje", value: String(appointmentsToday), icon: CalendarDays, tone: "blue", trend: "+0%" },
    { label: "Receitas do mês", value: money(revenue), icon: WalletCards, tone: "green", trend: "+0%" },
    { label: "Despesas do mês", value: money(expenseTotal), icon: BarChart3, tone: "red", trend: "0%" },
    { label: "Resultado do mês", value: money(result), icon: TrendingUp, tone: result < 0 ? "red" : "green", trend: result < 0 ? "negativo" : "positivo" }
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-greeting">
        <h1>Olá, Dra. Jennyff <span aria-hidden="true">👋</span></h1>
        <p>Aqui está o resumo do seu consultório hoje.</p>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <motion.button
            className={`summary-card ${card.value.startsWith("-") ? "negative" : ""} ${card.tone}`}
            key={card.label}
            onClick={() => onNavigate(card.label.includes("Despesas") || card.label.includes("Contas") ? "expenses" : "finance")}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <card.icon size={24} />
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.trend}</small>
          </motion.button>
        ))}
      </div>

      <div className="dashboard-main-grid">
        <article className="finance-chart-card">
          <div className="panel-heading">
            <div>
              <h2>Receitas x Despesas</h2>
              <p>Comparativo financeiro dos últimos meses</p>
            </div>
            <select aria-label="Período do gráfico" defaultValue="Este mês">
              <option>Este mês</option>
              <option>Últimos 6 meses</option>
              <option>Este ano</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 30, right: 18, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(100,115,146,0.18)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip
                contentStyle={{ border: "0", borderRadius: "12px", boxShadow: "0 16px 40px rgba(8,36,92,.16)" }}
                formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="receitas" stroke="#18b889" strokeWidth={4} dot={{ r: 4, fill: "#18b889", strokeWidth: 0 }} />
              <Line type="monotone" dataKey="despesas" stroke="#ff4d59" strokeWidth={4} dot={{ r: 4, fill: "#ff4d59", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          {appointments.length === 0 && expenses.length === 0 && (
            <p className="empty-chart">Cadastre atendimentos e despesas para visualizar o gráfico.</p>
          )}
        </article>

        <article className="pending-panel">
          <div className="panel-heading">
            <div>
              <h2>Pendências</h2>
              <p>Itens que precisam de atenção</p>
            </div>
          </div>
          <div className="pending-list">
            {pendingPatients.length === 0 ? (
              <div className="empty-pending">
                <CheckCircle2 size={54} />
                <strong>Nenhuma pendência cadastrada.</strong>
                <span>Tudo em dia! 🎉</span>
                <button onClick={() => onNavigate("finance")}>Ver todas as pendências</button>
              </div>
            ) : pendingPatients.map((patient) => (
              <button key={patient.name} onClick={() => onNavigate(patient.target)}>
                <span>{patient.name}</span>
                <strong>{patient.value}</strong>
              </button>
            ))}
          </div>
        </article>
      </div>

      <FinancialTimeline appointments={appointments} expenses={expenses} />

      <div className="post-login-actions">
        <button className="quick-action primary" onClick={() => onNavigate("appointments")}><Plus size={17} /> Novo atendimento</button>
        <button className="quick-action cyan" onClick={() => onNavigate("patients")}><UserPlus size={17} /> Novo paciente</button>
        <button className="quick-action green" onClick={() => onNavigate("finance")}><WalletCards size={17} /> Nova receita</button>
        <button className="quick-action red" onClick={() => onNavigate("expenses")}><ReceiptText size={17} /> Nova despesa</button>
        <button className="quick-action dark" onClick={() => onNavigate("reports")}><FileText size={17} /> Relatórios</button>
      </div>
    </section>
  );
}
