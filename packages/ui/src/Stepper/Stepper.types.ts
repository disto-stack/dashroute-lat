export interface StepperProps {
  steps?: [string, string, string];
  /** 1 = Recoger, 2 = Entregar, 3 = Listo */
  current: 1 | 2 | 3;
}
