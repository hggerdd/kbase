import React from "react";
import { LabelsPage } from "../labels/LabelsPage.jsx";
import { ResponsiveContainer } from "../../shared/layout/ResponsiveContainer";
import { TagIcon, FolderIcon, NoteIcon } from "../../shared/ui/Icons.jsx";
import { CategoriesSettingsPage } from "./CategoriesSettingsPage.jsx";
import { ProjectsSettingsPage } from "./ProjectsSettingsPage.jsx";

const SETTINGS_TABS = [
  { id: "labels", label: "Labels", icon: TagIcon },
  { id: "categories", label: "Categories", icon: NoteIcon },
  { id: "projects", label: "Projects", icon: FolderIcon },
];

function getSettingsSection(route) {
  const section = String(route || "").split("/")[1];
  return SETTINGS_TABS.some((tab) => tab.id === section) ? section : "labels";
}

export function SettingsPage({ route, onNavigate }) {
  const activeSection = getSettingsSection(route);

  return (
    <div className="settings-page">
      <ResponsiveContainer>
        <div className="settings-tabs" role="tablist" aria-label="Settings sections">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`settings-tab ${isActive ? "active" : ""}`}
                onClick={() => onNavigate(`settings/${tab.id}`)}
              >
                <span className="settings-tab-icon" aria-hidden="true">
                  <Icon />
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </ResponsiveContainer>

      {activeSection === "categories" ? <CategoriesSettingsPage /> : null}
      {activeSection === "labels" ? <LabelsPage /> : null}
      {activeSection === "projects" ? <ProjectsSettingsPage /> : null}
    </div>
  );
}
