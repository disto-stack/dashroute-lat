import { MouseEventHandler, ReactNode } from 'react';

export interface DetailPanelProps {
  title: string;
  subtitle?: ReactNode;
  onClose?: MouseEventHandler;
  /** Tablet: the panel floats over the table with a drawer shadow, over a `scrim`. */
  overlay?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
}
