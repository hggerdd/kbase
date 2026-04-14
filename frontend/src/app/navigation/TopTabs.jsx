import React from "react";
import { NAV_ITEMS } from "./nav-config";

export function TopTabs({ activeRoute, onNavigate }) {
  return (
    <nav className="top-tabs" aria-label="Sections">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`top-tab ${activeRoute === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="top-tab-kicker">{item.shortLabel}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
