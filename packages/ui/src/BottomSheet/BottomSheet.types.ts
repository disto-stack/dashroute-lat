import { MouseEventHandler, ReactNode } from 'react';

export interface BottomSheetProps {
  title: string;
  onClose?: MouseEventHandler;
  children?: ReactNode;
}
