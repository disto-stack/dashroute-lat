import { MouseEventHandler } from 'react';

export interface SwitchProps {
  checked?: boolean;
  /** Accessibility label — the component renders no visible text of its own. */
  label: string;
  disabled?: boolean;
  onClick?: MouseEventHandler;
}
