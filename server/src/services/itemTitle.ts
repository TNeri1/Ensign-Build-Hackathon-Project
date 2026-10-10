import { itemTitle } from '@vlf/shared';
import type { AppContext } from '../context';

/** The heading for an item (see itemTitle in @vlf/shared): its name, else "<public brand> <category>", else the category. */
export function titleOf(ctx: AppContext, item: { id: string; name: string | null; category: string }): string {
  const label = ctx.categories.get(item.category)?.label ?? item.category;
  if (item.name?.trim()) return item.name.trim();
  const brand = ctx.db
    .prepare(`SELECT value FROM item_attributes WHERE item_id = ? AND key = 'brand' AND is_public = 1`)
    .get(item.id) as { value: string } | undefined;
  return itemTitle(null, label, brand?.value);
}
