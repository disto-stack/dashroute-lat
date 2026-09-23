export interface TabOption {
  value: string;
  label: string;
}

export interface TabsProps {
  options: TabOption[];
  value: string;
  onChange?: (value: string) => void;
}
