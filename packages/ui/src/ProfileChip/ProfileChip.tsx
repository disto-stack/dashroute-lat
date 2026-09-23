import React from 'react';
import { Icon } from '../Icon';
import { ProfileChipProps } from './ProfileChip.types';
import styles from './ProfileChip.module.css';

export const ProfileChip = ({ name, initials, onClick }: ProfileChipProps) => {
  return (
    <button type="button" className={styles.chip} aria-haspopup="true" onClick={onClick}>
      <span className={styles.avatar}>{initials}</span>
      <span>{name}</span>
      <Icon name="chevron" size={18} />
    </button>
  );
};
