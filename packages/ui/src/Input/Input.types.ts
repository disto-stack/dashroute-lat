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
  /** For a problem with THIS field specifically. Renders a message below the field with a `danger` border. Never use this for login failures (wrong email/password) — that's a security tell; use `Banner` instead. */
  error?: string;
}
