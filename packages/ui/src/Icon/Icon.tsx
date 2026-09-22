import React from 'react';
import {
  ChevronDown,
  MapPin,
  Package,
  ArrowRight,
  Check,
  LogOut,
  Power,
  Navigation,
  X,
  Search,
  Plus,
  List,
  User,
  SlidersHorizontal,
  Menu,
  type LucideIcon,
} from 'lucide-react';
import { IconName, IconProps } from './Icon.types';

const ICONS: Record<IconName, LucideIcon> = {
  chevron: ChevronDown,
  pin: MapPin,
  box: Package,
  arrow: ArrowRight,
  check: Check,
  logout: LogOut,
  power: Power,
  nav: Navigation,
  close: X,
  search: Search,
  plus: Plus,
  list: List,
  user: User,
  sliders: SlidersHorizontal,
  menu: Menu,
};

export const Icon = ({ name, size = 20, strokeWidth = 2, color = 'currentColor' }: IconProps) => {
  const LucideIconComponent = ICONS[name];
  return <LucideIconComponent size={size} strokeWidth={strokeWidth} color={color} aria-hidden="true" />;
};
