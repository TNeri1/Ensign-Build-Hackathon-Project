import type { FieldDef } from '@vlf/shared';

export interface CategoryInfo {
  id: string;
  label: string;
  sensitive: boolean;
  fields: FieldDef[];
}
export interface Bin {
  id: string;
  code: string;
  label: string;
  item_count: number;
}
export interface ItemListRow {
  id: string;
  category: string;
  color: string;
  foundArea: string;
  foundAt: string;
  state: string;
  sensitive: number;
  hasPhoto: number;
  binCode: string | null;
}
