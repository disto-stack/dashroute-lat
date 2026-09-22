import React from 'react';
import { Icon } from '../Icon';
import { StatusPillProps } from './StatusPill.types';
import styles from './StatusPill.module.css';

export const StatusPill = ({ tone = 'success', dot = true, icon, children }: StatusPillProps) => {
  return (
    <span className={[styles.pill, styles[tone]].join(' ')}>
      {dot ? <span className={styles.dot} /> : null}
      {icon ? <Icon name={icon} size={16} strokeWidth={2.2} /> : null}
      {children}
    </span>
  );
};
