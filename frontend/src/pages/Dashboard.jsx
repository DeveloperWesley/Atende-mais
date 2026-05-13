import { BarChart3, CalendarDays, CheckCircle2, Download, FileText, Plus, UsersRound } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { FinancialTimeline } from "../components/FinancialTimeline.jsx";
import { money } from "../utils/formatters.js";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

function documentNeedOf(item) {
  if (item.documentNeed) return item.documentNeed;
  if (item.fiscalStatus === "NF emitida" || item.fiscalStatus === "NF solicitada") return "Nota fiscal";
  if (item.fiscalStatus === "Recibo emitido" || item.fiscalStatus === "Recibo solicitado") return "Recibo";
  return "Não precisa";
}

export function Dashboard({ onNavigate, store }) {
  const today = new Date().toISOString().slice(0, 10);
  const appointments = store?.appointments || [];
  const patients = store?.patients || [];
  const appointmentsToday = appointments.filter((item) => item.date?.slice(0, 10) === today).length;
  const totalReceived = appointments.reduce((sum, item) => sum + Number(item.amountNumber || 0), 0);
  const docRequests = appointments.filter((item) => ["Recibo", "Nota fiscal"].includes(documentNeedOf(item))).length;
  const missingData = appointments.filter((item) => !item.payerCpf || !item.patientCpf).length;
  const chartData = months.map((month) => ({ month, atendimentos: 0, recebido: 0 }));

  appointments.forEach((item) => {
    const date = item.date ? new Date(`${item.date.slice(0, 10)}T00:00:00`) : null;
    if (date && !Number.isNaN(date.getTime()) && chartData[date.getMonth()]) {
      chartData[date.getMonth()].atendimentos += 1;
      chartData[date.getMonth()].recebido += Number(item.amountNumber || 0);
    }
  });

  const pendingItems = [
    ...appointments.filter((item) => !item.payerCpf).map((item) => ({ name: `${item.payer || item.patient}: falta CPF/CNPJ do pagador`, target: "appointments" })),
    ...appointments.filter((item) => !item.patientCpf).map((item) => ({ name: `${item.patient}: falta CPF/CNPJ do paciente`, target: "appointments" })),
    ...appointments.filter((item) => documentNeedOf(item) === "Nota fiscal").map((item) => ({ name: `${item.patient}: emitir nota fiscal`, target: "reports" })),
    ...appointments.filter((item) => documentNeedOf(item) === "Recibo").map((item) => ({ name: `${item.patient}: emitir recibo`, target: "reports" }))
  ].slice(0, 6);

  const summaryCards = [
    { label: "Atendimentos hoje", value: String(appointmentsToday), icon: CalendarDays, tone: "blue", trend: `${appointments.length} no total` },
    { label: "Valor recebido", value: money(totalReceived), icon: BarChart3, tone: "green", trend: "base para relatórios" },
    { label: "Pacientes cadastrados", value: String(patients.length), icon: UsersRound, tone: "blue", trend: "cadastro automático" },
    { label: "NF/Recibo", value: String(docRequests), icon: FileText, tone: missingData ? "red" : "green", trend: missingData ? `${missingData} incompletos` : "dados completos" }
  ];

  return (
    <section className="dashboard-home">
      <div className="dashboard-hero-row">
        <div className="dashboard-greeting">
          <h1>Olá, Dra. Jennyff <span aria-hidden="true">👋</span></h1>
          <p>Controle seus atendimentos e mantenha os dados prontos para o contador.</p>
        </div>

        <div className="post-login-actions" aria-label="Ações rápidas">
          <button className="quick-action primary" onClick={() => onNavigate("appointments")}><Plus size={17} /> Novo atendimento</button>
          <button className="quick-action green" onClick={() => onNavigate("reports")}><Download size={17} /> Competências</button>
        </div>
      </div>

      <div className="summary-cards">
        {summaryCards.map((card, index) => (
          <motion.button
            className={`summary-card ${card.tone}`}
            key={card.label}
            onClick={() => onNavigate(card.label.includes("NF") ? "reports" : "appointments")}
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
              <h2>Atendimentos e valores</h2>
              <p>Visão rápida dos últimos meses para conferência</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 30, right: 18, left: 8, bottom: 12 }}>
              <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(100,115,146,0.18)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip
                contentStyle={{ border: "0", borderRadius: "12px", boxShadow: "0 16px 40px rgba(8,36,92,.16)" }}
                formatter={(value, name) => name === "recebido" ? money(value) : value}
              />
              <Line type="monotone" dataKey="atendimentos" stroke="#0d65df" strokeWidth={4} dot={{ r: 4, fill: "#0d65df", strokeWidth: 0 }} />
              <Line type="monotone" dataKey="recebido" stroke="#18b889" strokeWidth={4} dot={{ r: 4, fill: "#18b889", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          {appointments.length === 0 && <p className="empty-chart">Cadastre atendimentos para visualizar o gráfico.</p>}
        </article>

        <article className="pending-panel">
          <div className="panel-heading">
            <div>
              <h2>Pendências</h2>
              <p>Dados que impactam nota, Carnê-Leão, IRPF ou Receita Saúde</p>
            </div>
          </div>
          <div className="pending-list">
            {pendingItems.length === 0 ? (
              <div className="empty-pending">
                <CheckCircle2 size={54} />
                <strong>Nenhuma pendência cadastrada.</strong>
                <span>Tudo em dia!</span>
                <button onClick={() => onNavigate("appointments")}>Cadastrar atendimento</button>
              </div>
            ) : pendingItems.map((item) => (
              <button key={item.name} onClick={() => onNavigate(item.target)}>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </article>
      </div>

      <FinancialTimeline appointments={appointments} />
    </section>
  );
}
