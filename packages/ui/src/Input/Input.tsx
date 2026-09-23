import React, { useState } from 'react';
import { Icon } from '../Icon';
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
  onBlur,
  error,
}: InputProps) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Tracks typed text when the field is uncontrolled (no `value` prop), so the
  // toggle can still appear as the user types; controlled usage (the common
  // case) just reads `value` directly instead.
  const [text, setText] = useState(value ?? defaultValue ?? '');
  const currentValue = value !== undefined ? value : text;
  const fieldId = id ?? `dr-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const compact = size === 'compact';
  const isPassword = type === 'password';
  const showToggle = isPassword && currentValue.length > 0;
  return (
    <div
      className={[styles.field, compact && styles.compact, error && styles.fieldError].filter(Boolean).join(' ')}
    >
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input
          id={fieldId}
          className={[styles.input, showToggle && styles.inputWithToggle].filter(Boolean).join(' ')}
          type={isPassword && passwordVisible ? 'text' : type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            setText(e.target.value);
            onChange?.(e);
          }}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
        />
        {showToggle ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setPasswordVisible((v) => !v)}
            aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={18} />
          </button>
        ) : null}
      </div>
      {error ? (
        <div id={errorId} className={styles.error}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
