import React from "react";

export function StatCard({ label, value, tone = "default", detail, icon: Icon }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-card-top">
        <span>{label}</span>
        {Icon ? (
          <span className="stat-card-icon">
            <Icon />
          </span>
        ) : null}
      </div>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}
