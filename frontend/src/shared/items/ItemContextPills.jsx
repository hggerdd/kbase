import React, { useState } from "react";
import { NOTE_CATEGORIES } from "../../features/notes/constants";
import { PencilIcon } from "../ui/Icons";
import { OptionSelectModal } from "../ui/OptionSelectModal";
import { NoteLabelModal } from "../../pages/notes/components/NoteLabelModal";

function formatLabel(value) {
  return String(value ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function categoryOptionLabel(category) {
  if (category.full_path && category.full_path !== category.key) {
    return category.full_path.split("/").map(formatLabel).join(" / ");
  }
  return category.label || formatLabel(category.key);
}

export function ItemContextPills({
  availableCategories = [],
  availableLabels = [],
  availableProjects = [],
  categoryKey = "",
  categoryFallbacks = NOTE_CATEGORIES,
  emptyProjectLabel = "No project selected",
  onSelectCategory,
  onSelectProject,
  onToggleLabel,
  projectId = "",
  projectTitle = "",
  selectedLabelPaths = [],
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const currentCategory = categoryKey || "";
  const currentCategoryLabel = currentCategory ? formatLabel(currentCategory) : "Uncategorized";
  const managedCategoryOptions = availableCategories.map((category) => ({
    value: category.key,
    label: categoryOptionLabel(category),
  }));
  const fallbackCategoryOptions = categoryFallbacks.map((category) => ({
    value: category,
    label: formatLabel(category),
  }));
  const categoryOptions = managedCategoryOptions.length > 0 ? managedCategoryOptions : fallbackCategoryOptions;
  const visibleCategoryOptions = categoryOptions.some((option) => option.value === currentCategory)
    ? categoryOptions
    : [{ value: currentCategory, label: currentCategoryLabel }, ...categoryOptions];
  const projectOptions = [
    { value: "", label: "No project" },
    ...availableProjects.map((project) => ({
      value: project.id,
      label: project.title,
    })),
  ];

  async function handleCategorySelect(nextCategoryKey) {
    const success = await onSelectCategory?.(nextCategoryKey);
    if (success !== false) {
      setIsCategoryModalOpen(false);
    }
  }

  async function handleProjectSelect(nextProjectId) {
    const success = await onSelectProject?.(nextProjectId);
    if (success !== false) {
      setIsProjectModalOpen(false);
    }
  }

  return (
    <>
      <div className="note-taxonomy-row">
        <div className="note-project-row">
          <button
            className={`note-project-pill ${projectId ? "" : "empty"}`.trim()}
            type="button"
            onClick={() => setIsProjectModalOpen(true)}
          >
            {projectTitle || emptyProjectLabel}
          </button>
          <button
            className="plain-icon-button small"
            type="button"
            aria-label="Edit project"
            title="Edit project"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <PencilIcon />
          </button>
        </div>

        <div className="note-category-row">
          <button className="note-category-pill" type="button" onClick={() => setIsCategoryModalOpen(true)}>
            {currentCategoryLabel}
          </button>
          <button
            className="plain-icon-button small"
            type="button"
            aria-label="Edit category"
            title="Edit category"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <PencilIcon />
          </button>
        </div>

        <div className="note-label-pills">
          {selectedLabelPaths.length > 0 ? (
            selectedLabelPaths.map((labelPath) => (
              <button
                key={labelPath}
                type="button"
                className="note-label-pill"
                onClick={() => setIsLabelModalOpen(true)}
                title={labelPath}
              >
                {labelPath}
              </button>
            ))
          ) : (
            <button type="button" className="note-label-pill empty" onClick={() => setIsLabelModalOpen(true)}>
              No labels selected
            </button>
          )}
        </div>
      </div>

      {isCategoryModalOpen ? (
        <OptionSelectModal
          title="Set category"
          options={visibleCategoryOptions}
          selectedValue={currentCategory}
          onSelect={handleCategorySelect}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      ) : null}

      {isProjectModalOpen ? (
        <OptionSelectModal
          title="Set project"
          options={projectOptions}
          selectedValue={projectId}
          onSelect={handleProjectSelect}
          onClose={() => setIsProjectModalOpen(false)}
        />
      ) : null}

      {isLabelModalOpen ? (
        <NoteLabelModal
          labels={availableLabels}
          selectedPaths={selectedLabelPaths}
          onToggleLabel={onToggleLabel}
          onClose={() => setIsLabelModalOpen(false)}
        />
      ) : null}
    </>
  );
}
