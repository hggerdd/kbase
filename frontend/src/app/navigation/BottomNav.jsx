import React from "react";
import { NAV_ITEMS } from "./nav-config";
import { getNavIcon } from "../../shared/ui/Icons";

export function BottomNav({ activeRoute, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const Icon = getNavIcon(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-pill ${activeRoute === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-pill-glyph" aria-hidden="true">
              <Icon />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
