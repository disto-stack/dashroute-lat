import React from 'react';
import { Icon } from '../Icon';
import { OrderTimelineProps } from './OrderTimeline.types';
import { TL_STEPS, TL_INDEX } from './OrderTimeline.steps';
import styles from './OrderTimeline.module.css';

export const OrderTimeline = ({ status, times = {}, note }: OrderTimelineProps) => {
  if (status === 'CANCELLED') {
    return (
      <div className={styles.cancel} role="status">
        <span className={styles.cancelIcon}>
          <Icon name="close" size={18} strokeWidth={2.4} />
        </span>
        <div>
          <div className={styles.label}>Pedido cancelado</div>
          {note ? <div className={styles.sub}>{note}</div> : null}
        </div>
      </div>
    );
  }

  const idx = TL_INDEX[status] ?? 0;
  const delivered = status === 'DELIVERED';

  return (
    <ol className={styles.timeline} aria-label="Estado del pedido">
      {TL_STEPS.map((step, i) => {
        const state = i < idx || (delivered && i === idx) ? 'done' : i === idx ? 'current' : 'todo';
        const sub = state === 'current' ? step.doing : times[step.key];
        return (
          <li
            key={step.key}
            className={[styles.item, styles[state]].join(' ')}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <div className={styles.rail} aria-hidden="true">
              <span className={styles.mark}>
                {state === 'done' ? (
                  <Icon name="check" size={14} strokeWidth={3} />
                ) : state === 'current' ? (
                  <span className={styles.dot} />
                ) : null}
              </span>
              {i < TL_STEPS.length - 1 ? <span className={styles.line} /> : null}
            </div>
            <div className={styles.text}>
              <div className={styles.label}>{step.label}</div>
              {sub ? <div className={styles.sub}>{sub}</div> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
