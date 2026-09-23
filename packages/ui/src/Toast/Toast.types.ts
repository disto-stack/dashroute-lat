import { MouseEventHandler, ReactNode } from 'react';
import { IconName } from '../Icon';

export interface ToastProps {
  children: ReactNode;
  /** Defaults to "neutral". */
  tone?: 'success' | 'danger' | 'warning' | 'neutral';
  /** Defaults per tone (success: check, danger/warning: alert, neutral: none). Pass `false` for no icon regardless of tone. */
  icon?: IconName | false;
  actionLabel?: string;
  onAction?: MouseEventHandler;
  onDismiss?: MouseEventHandler;
}
