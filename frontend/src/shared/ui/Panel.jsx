import React from "react";

export function Panel({ children, className = "", title, eyebrow, action }) {
  return (
    <section className={`panel ${className}`.trim()}>
      {(title || eyebrow || action) && (
        <div className="panel-header">
          <div>
            {eyebrow ? <p className="panel-label">{eyebrow}</p> : null}
            {title ? <h3>{title}</h3> : null}
          </div>
          {action ?? null}
        </div>
      )}
      {children}
    </section>
  );
}
