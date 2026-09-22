import { ReactNode } from 'react';

export interface MissionCardProps {
  tone?: 'paper' | 'blue';
  /** Badge text on a blue card, e.g. "Nueva misión asignada". */
  badge?: string;
  order?: string;
  /** Adds the deeper offer shadow used by the floating new-mission notification. */
  offer?: boolean;
  actions?: ReactNode;
  actionsRow?: boolean;
  children?: ReactNode;
}
