import { MouseEventHandler, ReactNode } from 'react';
import { IconName } from '../Icon';

export interface ButtonProps {
  /**
   * primary: blue fill (default). on-blue: white fill for use on a blue
   * card. secondary: paper-tone fill. on-blue-ghost: translucent white fill
   * on a blue card.
   */
  variant?: 'primary' | 'on-blue' | 'secondary' | 'on-blue-ghost';
  icon?: IconName;
  href?: string;
  auto?: boolean;
  /** compact: 40px, auto width, for the panel de admin. Default is the 56-60px touch size of the driver app. */
  size?: 'default' | 'compact';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: MouseEventHandler;
  children: ReactNode;
}
