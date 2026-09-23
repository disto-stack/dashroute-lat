import { MouseEventHandler } from 'react';

export interface EarningsPillProps {
  label?: string;
  amount: string;
  onClick?: MouseEventHandler;
}
