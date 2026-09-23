import React from 'react';
import { TabsProps } from './Tabs.types';
import styles from './Tabs.module.css';

export const Tabs = ({ options, value, onChange }: TabsProps) => {
  return (
    <div className={styles.tabs} role="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={[styles.item, active && styles.active].filter(Boolean).join(' ')}
            onClick={onChange ? () => onChange(option.value) : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
