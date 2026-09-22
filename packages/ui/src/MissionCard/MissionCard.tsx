import React from 'react';
import { StatusPill } from '../StatusPill';
import { MissionCardProps } from './MissionCard.types';
import styles from './MissionCard.module.css';

export const MissionCard = ({
  tone = 'paper',
  badge,
  order,
  offer = false,
  actions,
  actionsRow = false,
  children,
}: MissionCardProps) => {
  const className = [styles.card, styles[tone], offer && styles.offer].filter(Boolean).join(' ');
  return (
    <section className={className}>
      {badge || order ? (
        <div className={styles.head}>
          {badge ? (
            <StatusPill tone="on-blue" dot={false} icon="box">
              {badge}
            </StatusPill>
          ) : (
            <span />
          )}
          {order ? <span className={styles.order}>{order}</span> : null}
        </div>
      ) : null}
      {children ? <div>{children}</div> : null}
      {actions ? (
        <div className={[styles.actions, actionsRow && styles.actionsRow].filter(Boolean).join(' ')}>{actions}</div>
      ) : null}
    </section>
  );
};
