import { ReactNode } from 'react';
import { IconName } from '../Icon';

export interface StatusPillProps {
  tone?: 'success' | 'neutral' | 'on-blue';
  dot?: boolean;
  icon?: IconName;
  children: ReactNode;
}
