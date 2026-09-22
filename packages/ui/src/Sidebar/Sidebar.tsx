import React from 'react';
import { Icon } from '../Icon';
import { Logo } from '../Logo';
import { SidebarProps } from './Sidebar.types';
import styles from './Sidebar.module.css';

export const Sidebar = ({ items, current, collapsed = false, brand = 'DashRoute', label, footer, onSelect }: SidebarProps) => {
  return (
    <nav
      className={[styles.sidebar, collapsed && styles.rail].filter(Boolean).join(' ')}
      aria-label={label || 'Navegación principal'}
    >
      <div className={styles.brand}>
        <Logo size={36} />
        {collapsed ? null : <span className={styles.name}>{brand}</span>}
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.id === current;
          return (
            <li key={item.id}>
              <a
                href={item.href || '#'}
                aria-current={active ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={[styles.item, active && styles.active].filter(Boolean).join(' ')}
                onClick={
                  onSelect
                    ? (e) => {
                        e.preventDefault();
                        onSelect(item.id);
                      }
                    : undefined
                }
              >
                <Icon name={item.icon} size={20} />
                {collapsed ? null : <span className={styles.label}>{item.label}</span>}
                {!collapsed && item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
              </a>
            </li>
          );
        })}
      </ul>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
};
