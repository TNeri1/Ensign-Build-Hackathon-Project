import type { IconName } from '../components/m3/icons';

/** Icon per category id. New categories fall back to a generic icon; add a line here to give one its own. */
const BY_CATEGORY: Record<string, IconName> = {
  phone: 'smartphone',
  wallet: 'account_balance_wallet',
  keys: 'key',
  bag: 'backpack',
  clothing: 'checkroom',
  id_card: 'badge',
  payment_card: 'credit_card',
  laptop: 'laptop_mac',
  water_bottle: 'water_bottle',
  headphones: 'headphones',
};

export function categoryIcon(categoryId: string): IconName {
  return BY_CATEGORY[categoryId] ?? 'category';
}
