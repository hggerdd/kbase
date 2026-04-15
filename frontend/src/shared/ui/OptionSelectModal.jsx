import React from "react";

export function OptionSelectModal({
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  className = "",
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={`modal-sheet option-select-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="option-select-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="option-select-title">{title}</h2>
        </div>

        <div className="option-select-list">
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            const isSelected = value === selectedValue;

            return (
              <button
                key={value}
                type="button"
                className={`option-select-row ${isSelected ? "active" : ""}`.trim()}
                onClick={() => onSelect(value)}
              >
                <span>{label}</span>
                {isSelected ? <strong>Selected</strong> : null}
              </button>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </section>
    </div>
  );
}
