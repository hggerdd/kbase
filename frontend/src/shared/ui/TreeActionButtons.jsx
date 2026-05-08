import React from "react";
import { RoundIconButton } from "./RoundIconButton.jsx";

export function TreeActionButtons({
  className = "",
  collapseLabel,
  expandLabel,
  onCollapse,
  onExpand,
}) {
  return (
    <div className={`workspace-tree-tools ${className}`.trim()}>
      <RoundIconButton
        type="button"
        size="sm"
        className="workspace-tree-action"
        aria-label={expandLabel}
        title={expandLabel}
        onClick={onExpand}
      >
        +
      </RoundIconButton>
      <RoundIconButton
        type="button"
        size="sm"
        className="workspace-tree-action"
        aria-label={collapseLabel}
        title={collapseLabel}
        onClick={onCollapse}
      >
        -
      </RoundIconButton>
    </div>
  );
}
