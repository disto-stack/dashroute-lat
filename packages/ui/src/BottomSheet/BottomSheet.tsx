import React from 'react';
import { Icon } from '../Icon';
import { BottomSheetProps } from './BottomSheet.types';
import styles from './BottomSheet.module.css';

export const BottomSheet = ({ title, onClose, children }: BottomSheetProps) => {
  return (
    <section className={styles.sheet} role="dialog" aria-label={title}>
      <div className={styles.handle} />
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.close} aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
      </div>
      {children}
    </section>
  );
};
