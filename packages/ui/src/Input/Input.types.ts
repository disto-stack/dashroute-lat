import { ChangeEventHandler } from 'react';

export interface InputProps {
  label: string;
  id?: string;
  size?: 'default' | 'compact';
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  autoComplete?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}
