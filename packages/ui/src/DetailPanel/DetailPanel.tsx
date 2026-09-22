import React from 'react';
import { Icon } from '../Icon';
import { DetailPanelProps } from './DetailPanel.types';
import styles from './DetailPanel.module.css';

export const DetailPanel = ({ title, subtitle, onClose, overlay = false, footer, children }: DetailPanelProps) => {
  return (
    <aside className={[styles.panel, overlay && styles.overlay].filter(Boolean).join(' ')} aria-label={title}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <div className={styles.sub}>{subtitle}</div> : null}
        </div>
        <button type="button" className={styles.close} aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.foot}>{footer}</div> : null}
    </aside>
  );
};
