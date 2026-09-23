import React from 'react';
import { Icon } from '../Icon';
import { SelectProps } from './Select.types';
import styles from './Select.module.css';

export const Select = ({
  label,
  options,
  size = 'default',
  id,
  placeholder,
  value,
  defaultValue,
  onChange,
  error,
}: SelectProps) => {
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
      <div className={styles.wrap}>
        <select
          id={fieldId}
          className={styles.input}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
        >
          {placeholder ? (
            <option value="">{placeholder}</option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.chev}>
          <Icon name="chevron" size={18} />
        </span>
      </div>
      {error ? (
        <div id={errorId} className={styles.error}>
          {error}
        </div>
      ) : null}
    </div>
  );
};
