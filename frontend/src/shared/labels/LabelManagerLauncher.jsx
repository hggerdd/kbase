import React, { useState } from "react";
import { useLabelsWorkspace } from "../../features/labels/hooks.js";
import { LabelManagerModal } from "../../pages/labels/components/LabelManagerModal.jsx";

export function LabelManagerLauncher({ buttonLabel = "Manage labels", buttonClassName = "secondary", onLabelsChanged }) {
  const workspace = useLabelsWorkspace();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={buttonClassName} type="button" onClick={() => setIsOpen(true)}>
        {buttonLabel}
      </button>
      <LabelManagerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workspace={workspace}
        onLabelsChanged={onLabelsChanged}
      />
    </>
  );
}
