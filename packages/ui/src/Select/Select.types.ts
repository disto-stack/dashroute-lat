import { ChangeEventHandler } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  size?: 'default' | 'compact';
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  /** Same behavior as `Input.error`: a `danger` border plus a message below the field. */
  error?: string;
}
