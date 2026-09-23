import React from 'react';
import { InputProps } from './Input.types';
import styles from './Input.module.css';

export const Input = ({
  label,
  id,
  size = 'default',
  type = 'text',
  placeholder,
  value,
  defaultValue,
  autoComplete,
  onChange,
  error,
}: InputProps) => {
  const fieldId = id ?? `dr-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const compact = size === 'compact';
  return (
    <div
      className={[styles.field, compact && styles.compact, error && styles.fieldError].filter(Boolean).join(' ')}
    >
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <input
        id={fieldId}
        className={styles.input}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
      />
      {error ? (
        <div id={errorId} className={styles.error}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
