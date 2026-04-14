import React from "react";

export function PageHeader({ eyebrow, title, description, actions, aside }) {
  return (
    <section className="page-header panel panel-hero">
      <div className="page-header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        <p>{description}</p>
        {actions ? <div className="header-actions">{actions}</div> : null}
      </div>
      {aside ? <div className="page-header-aside">{aside}</div> : null}
    </section>
  );
}
