import React from "react";

export function SearchBox({
  buttonLabel = "Search",
  onChange,
  onSubmit,
  placeholder,
  value,
}) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      <button type="submit">{buttonLabel}</button>
    </form>
  );
}
