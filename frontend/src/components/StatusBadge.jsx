const statusMap = {
  Pago: "success",
  Paga: "success",
  Receita: "success",
  Ativo: "success",
  Pendente: "warning",
  Vencido: "danger",
  Vencida: "danger",
  Cancelado: "muted",
  Cancelada: "muted",
  Despesa: "danger",
  Incompleto: "warning",
  "Recibo emitido": "info",
  "NF emitida": "info",
  "Dados completos": "success"
};

export function StatusBadge({ value }) {
  if (!value) return <span className="status-badge muted">-</span>;
  const tone = statusMap[value] || (String(value).includes("Falta") ? "warning" : "info");
  return <span className={`status-badge ${tone}`}>{value}</span>;
}
