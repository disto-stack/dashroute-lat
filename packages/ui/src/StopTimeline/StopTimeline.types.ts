export interface Stop {
  name: string;
  addr: string;
}

export interface StopTimelineProps {
  pickup: Stop;
  dropoff: Stop;
  tone?: 'blue' | 'paper';
}
