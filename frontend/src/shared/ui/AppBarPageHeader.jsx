import React from "react";

export function AppBarPageHeader({ appName = "kbase", title, countLabel, status }) {
  return (
    <div className="app-bar-page-header">
      <span className="app-bar-page-app">{appName}</span>
      <strong>{title}</strong>
      {countLabel ? <span className="app-bar-page-count">{countLabel}</span> : null}
      {status ? (
        <span className="app-bar-page-status" aria-label={status.label} title={status.label}>
          <span className="pulse-dot" />
        </span>
      ) : null}
    </div>
  );
}
