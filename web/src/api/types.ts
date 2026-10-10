import type { FieldDef } from '@vlf/shared';

export interface CategoryInfo {
  id: string;
  label: string;
  sensitive: boolean;
  /** Item name is mandatory at intake for this category (e.g. 'other'). */
  nameRequired: boolean;
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
  /** Staff-given name, or null. */
  name: string | null;
  /** Heading to show: name, else "<brand> <category>", else category (server-computed). */
  title: string;
  color: string;
  foundArea: string;
  foundAt: string;
  state: string;
  sensitive: number;
  hasPhoto: number;
  binCode: string | null;
}
