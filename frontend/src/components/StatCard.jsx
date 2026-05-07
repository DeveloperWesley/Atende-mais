export function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span className="stat-icon">{Icon && <Icon size={19} />}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
