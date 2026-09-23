export type IconName =
  | 'chevron'
  | 'pin'
  | 'box'
  | 'arrow'
  | 'check'
  | 'logout'
  | 'power'
  | 'nav'
  | 'close'
  | 'search'
  | 'plus'
  | 'list'
  | 'user'
  | 'sliders'
  | 'menu'
  | 'alert'
  | 'eye'
  | 'eye-off';

export interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /**
   * Web defaults to inheriting `currentColor`; React Native has no text
   * color inheritance for SVG, so pass `color` explicitly there (defaults
   * to `tokens.colors.ink`).
   */
  color?: string;
}
