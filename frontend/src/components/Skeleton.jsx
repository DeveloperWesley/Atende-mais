export function Skeleton({ className = "" }) {
  return <span className={`skeleton ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard-home">
      <Skeleton className="skeleton-title" />
      <div className="summary-cards">
        {Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="skeleton-card" />)}
      </div>
      <div className="dashboard-main-grid">
        <Skeleton className="skeleton-panel" />
        <Skeleton className="skeleton-panel" />
      </div>
    </div>
  );
}
