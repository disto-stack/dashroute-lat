import React from 'react';
import { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onPress}
      disabled={disabled}
    >
      {title}
    </button>
  );
};
