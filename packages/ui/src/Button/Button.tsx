import React from 'react';
import { Icon } from '../Icon';
import { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export const Button = ({
  variant = 'primary',
  icon,
  href,
  auto = false,
  size = 'default',
  type = 'button',
  disabled = false,
  onClick,
  children,
}: ButtonProps) => {
  const compact = size === 'compact';
  const className = [
    styles.button,
    styles[variant],
    (auto || compact) && styles.auto,
    compact && styles.compact,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {icon ? <Icon name={icon} size={compact ? 18 : 20} strokeWidth={2.4} /> : null}
    </>
  );

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
};
