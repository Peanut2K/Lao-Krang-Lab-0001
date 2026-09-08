"use client";

import { useId } from "react";

/**
 * Type-or-pick field: a normal text input with a native dropdown of suggestions.
 * The preset list is a shortcut, not a limit — anywhere in Thailand can be typed
 * in, and a reverse-geocoded value that is not in the list stays as it is.
 */
export function ComboField({
  label,
  value,
  options,
  placeholder,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  hint?: React.ReactNode;
  onChange: (value: string) => void;
}) {
  const listId = useId();

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="input"
        list={listId}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
