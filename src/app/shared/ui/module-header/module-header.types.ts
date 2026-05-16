export interface ModuleTab {
  id: string;
  label: string;
  count?: number;
}

export interface ModuleHeaderAction {
  label: string;
  value: string;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
  icon?: string;
}
