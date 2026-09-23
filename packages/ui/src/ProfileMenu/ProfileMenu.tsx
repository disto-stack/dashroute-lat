import React from 'react';
import { Icon } from '../Icon';
import { Switch } from '../Switch';
import { ProfileMenuProps } from './ProfileMenu.types';
import styles from './ProfileMenu.module.css';

export const ProfileMenu = ({
  available,
  onAvailableChange,
  availableLabel = 'Activo',
  availabilityLabel = 'DISPONIBILIDAD',
  items = [],
}: ProfileMenuProps) => {
  return (
    <div className={styles.menu} role="menu">
      <div>
        <div className={styles.eyebrow}>{availabilityLabel}</div>
        <div className={styles.row}>
          <span className={styles.label}>{availableLabel}</span>
          <Switch checked={available} onClick={onAvailableChange} label={availableLabel} />
        </div>
      </div>
      {items.length ? <div className={styles.divider} /> : null}
      {items.length ? (
        <div className={styles.items}>
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              role="menuitem"
              className={[styles.item, item.tone === 'danger' && styles.danger].filter(Boolean).join(' ')}
              onClick={item.onClick}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
