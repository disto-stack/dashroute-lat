import { ReactNode } from 'react';
import { IconName } from '../Icon';

export interface SidebarItem {
  id: string;
  label: string;
  icon: IconName;
  href?: string;
  badge?: string | number;
}

export interface SidebarProps {
  items: SidebarItem[];
  current: string;
  /** Icon-only rail (tablet). Labels stay available to screen readers. */
  collapsed?: boolean;
  brand?: string;
  label?: string;
  footer?: ReactNode;
  onSelect?: (id: string) => void;
}
