import { MouseEventHandler } from 'react';

export interface ProfileChipProps {
  name: string;
  initials: string;
  onClick?: MouseEventHandler;
}
