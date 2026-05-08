import React from "react";

export function RoundIconButton({
  children,
  className = "",
  size = "md",
  variant = "secondary",
  ...props
}) {
  return (
    <button
      {...props}
      className={`${variant} round-icon-button round-icon-button-${size} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
