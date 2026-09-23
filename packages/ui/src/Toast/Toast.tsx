import React from 'react';
import { Icon, IconName } from '../Icon';
import { ToastProps } from './Toast.types';
import styles from './Toast.module.css';

const DEFAULT_ICON: Record<NonNullable<ToastProps['tone']>, IconName | null> = {
  success: 'check',
  danger: 'alert',
  warning: 'alert',
  neutral: null,
};

export const Toast = ({ children, tone = 'neutral', icon, actionLabel, onAction, onDismiss }: ToastProps) => {
  const resolvedIcon = icon === false ? null : icon ?? DEFAULT_ICON[tone];
  return (
    <div className={[styles.toast, styles[tone]].filter(Boolean).join(' ')} role="status" aria-live="polite">
      {resolvedIcon ? (
        <span className={tone === 'neutral' ? styles.icon : undefined}>
          <Icon name={resolvedIcon} size={20} strokeWidth={2.2} />
        </span>
      ) : null}
      <div className={styles.text}>{children}</div>
      {onAction ? (
        <button type="button" className={styles.action} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label="Cerrar" onClick={onDismiss}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
};
