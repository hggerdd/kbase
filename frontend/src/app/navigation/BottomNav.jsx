import React from "react";
import { NAV_ITEMS } from "./nav-config";

export function BottomNav({ activeRoute, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-pill ${activeRoute === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-pill-glyph" aria-hidden="true">
            {item.shortLabel}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
