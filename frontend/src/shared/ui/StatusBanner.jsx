import React from "react";

export function StatusBanner({ error, notice }) {
  if (!error && !notice) {
    return null;
  }

  return (
    <div className="status-stack">
      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
