import React from 'react';
import { StopTimelineProps } from './StopTimeline.types';
import styles from './StopTimeline.module.css';

export const StopTimeline = ({ pickup, dropoff, tone = 'blue' }: StopTimelineProps) => {
  const stops = [
    { label: 'Recoger en', s: pickup },
    { label: 'Entregar en', s: dropoff },
  ];
  return (
    <div className={[styles.stops, styles[tone]].join(' ')}>
      <div className={styles.rail} aria-hidden="true">
        <span className={styles.from} />
        <span className={styles.line} />
        <span className={styles.to} />
      </div>
      <div className={styles.list}>
        {stops.map((stop, i) => (
          <div key={i}>
            <div className={styles.label}>{stop.label}</div>
            <div className={styles.name}>{stop.s.name}</div>
            <div className={styles.addr}>{stop.s.addr}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
