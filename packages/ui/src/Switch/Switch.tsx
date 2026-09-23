import React from 'react';
import { SwitchProps } from './Switch.types';
import styles from './Switch.module.css';

export const Switch = ({ checked = false, label, disabled = false, onClick }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={[styles.switch, checked && styles.on].filter(Boolean).join(' ')}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.thumb} />
    </button>
  );
};
