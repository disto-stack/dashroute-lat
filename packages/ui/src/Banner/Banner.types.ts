import { MouseEventHandler, ReactNode } from 'react';
import { IconName } from '../Icon';

export interface BannerProps {
  children: ReactNode;
  tone?: 'danger' | 'warning' | 'success';
  /** Defaults to "alert". */
  icon?: IconName;
  onRetry?: MouseEventHandler;
  /** Defaults to "Reintentar". */
  retryLabel?: string;
}
