/**
 * The heading shown for an item everywhere (inventory, detail, claims, public search):
 * its own name when staff gave one ("AirPods case"), else brand + category ("Apple phone"), else the category.
 * Only public information goes in: the name is public, and brand is a public field.
 */
export function itemTitle(name: string | null | undefined, categoryLabel: string, publicBrand?: string | null): string {
  const n = name?.trim();
  if (n) return n;
  const b = publicBrand?.trim();
  return b ? `${b} ${categoryLabel.toLowerCase()}` : categoryLabel;
}

export const ITEM_NAME_MAX = 60;
