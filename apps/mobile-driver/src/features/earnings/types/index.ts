
export type DeliveredOrder = {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

export type OrdersPage = {
  data: DeliveredOrder[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type EarningsEntry = {
  orderId: string;
  amount: number;
  at: Date;
};

export type DayEarnings = {
  date: string;
  label: string;
  total: number;
  count: number;
};

export type EarningsSummary = {
  today: { total: number; count: number; entries: EarningsEntry[] };
  week: { total: number; count: number; days: DayEarnings[] };
};
