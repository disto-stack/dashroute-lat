import React from 'react';
import { StepperProps } from './Stepper.types';
import styles from './Stepper.module.css';

const DEFAULT_STEPS: [string, string, string] = ['Recoger', 'Entregar', 'Listo'];

export const Stepper = ({ steps = DEFAULT_STEPS, current }: StepperProps) => {
  return (
    <div className={styles.stepper} role="list" aria-label="Progreso de la misión">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n === current ? 'current' : n < current ? 'done' : 'todo';
        return (
          <div
            key={n}
            role="listitem"
            aria-current={n === current ? 'step' : undefined}
            className={[styles.step, styles[state]].filter(Boolean).join(' ')}
          >
            <div className={styles.bar} />
            <div className={styles.label}>
              {n} · {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
