import React from "react";
import { NAV_ITEMS } from "./nav-config";
import { getNavIcon } from "../../shared/ui/Icons";

const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS,
  { id: "settings", label: "Settings", navigateTo: "settings/labels" },
];

export function BottomNav({ activeRoute, onNavigate }) {
  const activeRoot = String(activeRoute || "home").split("/")[0];
  const normalizedActiveRoute = activeRoot === "notes" ? "home" : activeRoot;

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = getNavIcon(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-pill ${normalizedActiveRoute === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.navigateTo ?? item.id)}
            aria-label={item.label}
            title={item.label}
          >
            <span className="nav-pill-glyph" aria-hidden="true">
              <Icon />
            </span>
          </button>
        );
      })}
    </nav>
  );
}
