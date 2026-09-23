import React from 'react';
import { Icon } from '../Icon';
import { BannerProps } from './Banner.types';
import styles from './Banner.module.css';

export const Banner = ({ children, tone = 'danger', icon = 'alert', onRetry, retryLabel = 'Reintentar' }: BannerProps) => {
  return (
    <div className={[styles.banner, styles[tone]].join(' ')} role="alert">
      <Icon name={icon} size={20} strokeWidth={2.2} />
      <div className={styles.text}>{children}</div>
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
};
