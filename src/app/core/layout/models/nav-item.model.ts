export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  roles?: string[];
  children?: NavItem[];
  badge?: string;
  featureFlag?: string;
  hidden?: boolean;
}
