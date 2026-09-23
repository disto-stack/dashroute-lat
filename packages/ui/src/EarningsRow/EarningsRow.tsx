import React from 'react';
import { EarningsRowProps } from './EarningsRow.types';
import styles from './EarningsRow.module.css';

export const EarningsRow = ({ from, to, order, amount, last = false }: EarningsRowProps) => {
  return (
    <div className={[styles.row, last && styles.noBorder].filter(Boolean).join(' ')}>
      <div>
        <div className={styles.route}>
          {from} → {to}
        </div>
        <div className={styles.order}>Orden {order}</div>
      </div>
      <div className={styles.amount}>{amount}</div>
    </div>
  );
};
