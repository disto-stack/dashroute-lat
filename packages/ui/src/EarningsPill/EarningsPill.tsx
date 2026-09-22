import React from 'react';
import { EarningsPillProps } from './EarningsPill.types';
import styles from './EarningsPill.module.css';

export const EarningsPill = ({ label = 'Hoy', amount, onClick }: EarningsPillProps) => {
  return (
    <button type="button" className={styles.pill} aria-label="Ver resumen de ganancias" onClick={onClick}>
      <span className={styles.micro}>{label}</span>
      <span className={styles.amount}>{amount}</span>
    </button>
  );
};
