import { motion } from "framer-motion";
import { CalendarCheck, FileSpreadsheet, WalletCards } from "lucide-react";
import { formatDate, formatDateTime } from "../utils/formatters.js";

export function FinancialTimeline({ appointments = [] }) {
  const events = [
    ...appointments.slice(0, 4).map((item) => ({
      id: `appointment-${item.id}`,
      icon: CalendarCheck,
      title: "Atendimento realizado",
      description: `${item.patient} - ${item.amount}`,
      date: formatDateTime(item.date),
      tone: "blue"
    })),
    ...appointments.filter((item) => item.status === "Pago").slice(0, 3).map((item) => ({
      id: `revenue-${item.id}`,
      icon: WalletCards,
      title: "Pagamento recebido",
      description: `${item.payer || item.patient} - ${item.netAmount || item.amount}`,
      date: formatDate(item.receivedAt),
      tone: "green"
    }))
  ].slice(0, 7);

  if (!events.length) {
    events.push({
      id: "empty-report",
      icon: FileSpreadsheet,
      title: "Tudo pronto para começar",
      description: "Cadastre um atendimento para montar sua linha do tempo.",
      date: "Hoje",
      tone: "blue"
    });
  }

  return (
    <article className="timeline-panel">
      <h2>Linha do tempo de atendimentos</h2>
      <div className="timeline-list">
        {events.map((event, index) => (
          <motion.div
            className={`timeline-item ${event.tone}`}
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <span className="timeline-icon"><event.icon size={16} /></span>
            <div>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
            </div>
            <small>{event.date}</small>
          </motion.div>
        ))}
      </div>
    </article>
  );
}
