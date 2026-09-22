import React from 'react';
import { LogoProps } from './Logo.types';
import styles from './Logo.module.css';

export const Logo = ({ variant = 'mark', tone = 'default', size = 36 }: LogoProps) => {
  const inverse = tone === 'inverse';
  const c = inverse
    ? { tile: 'var(--card)', line: 'var(--blue)', dash: 'var(--handle)', dashOp: 1, dot: 'var(--blue)', hole: 'var(--card)' }
    : { tile: 'var(--blue)', line: 'var(--on-blue)', dash: 'var(--on-blue)', dashOp: 0.2, dot: 'var(--card)', hole: 'var(--blue)' };

  const mark = (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role="img"
      aria-label={variant === 'lockup' ? undefined : 'DashRoute'}
      aria-hidden={variant === 'lockup' ? 'true' : undefined}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <rect width={96} height={96} rx={28} fill={c.tile} />
      <path d="M46 66H70M56 78H70" fill="none" stroke={c.dash} strokeOpacity={c.dashOp} strokeWidth={5} strokeLinecap="round" />
      <path
        d="M26 68V60Q26 46 40 46H56Q70 46 70 32V30"
        fill="none"
        stroke={c.line}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={26} cy={70} r={8} fill={c.hole} stroke={c.line} strokeWidth={5} />
      <circle cx={70} cy={26} r={11} fill={inverse ? 'var(--blue)' : 'var(--card)'} />
      <circle cx={70} cy={26} r={4.5} fill={inverse ? 'var(--card)' : 'var(--ink)'} />
    </svg>
  );

  if (variant !== 'lockup') return mark;

  const fs = size / 1.47;
  return (
    <span
      className={styles.logo}
      role="img"
      aria-label="DashRoute"
      style={{ gap: fs * 0.37, fontSize: fs, color: inverse ? 'var(--on-blue)' : 'var(--ink)' }}
    >
      {mark}
      <span className={styles.word} aria-hidden="true">
        <span style={{ fontWeight: 600 }}>Dash</span>
        <span style={{ fontWeight: 800, color: inverse ? 'var(--on-blue)' : 'var(--blue)' }}>Route</span>
      </span>
    </span>
  );
};
