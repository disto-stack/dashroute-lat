import { MouseEventHandler } from 'react';
import { IconName } from '../Icon';

export interface ProfileMenuItem {
  icon: IconName;
  label: string;
  tone?: 'default' | 'danger';
  onClick?: MouseEventHandler;
}

export interface ProfileMenuProps {
  available?: boolean;
  onAvailableChange?: MouseEventHandler;
  /** Label next to the Switch. Defaults to "Activo". */
  availableLabel?: string;
  /** Eyebrow above the availability row. Defaults to "DISPONIBILIDAD". */
  availabilityLabel?: string;
  items?: ProfileMenuItem[];
}
