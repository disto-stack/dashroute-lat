export interface EarningsRowProps {
  from: string;
  to: string;
  /** Rendered as "Orden {order}". */
  order: string;
  amount: string;
  /** Omits the divider line — set on the last row of a list. */
  last?: boolean;
}
