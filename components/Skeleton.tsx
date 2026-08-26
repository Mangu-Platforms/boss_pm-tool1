export function Skeleton({ lines = 3, width = "100%" }: { lines?: number; width?: string }) {
  return (
    <div className="skeleton-wrap" style={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: `${85 + Math.random() * 15}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ width: "40%" }} />
      <div className="skeleton-line" style={{ width: "70%" }} />
      <div className="skeleton-line" style={{ width: "55%" }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-wrap">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-line" style={{ width: "30%" }} />
          <div className="skeleton-line" style={{ width: "15%" }} />
          <div className="skeleton-line" style={{ width: "12%" }} />
          <div className="skeleton-line" style={{ width: "10%" }} />
        </div>
      ))}
    </div>
  );
}
