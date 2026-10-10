/**
 * The scripted demo. The lost report below is seeded; the item is NOT seeded:
 * staff log it live (see DEMO.md). Values here are the single source of truth.
 */
export const DEMO_REPORT = {
  category: 'phone',
  color: 'black',
  area: 'Gate 3',
  description: 'Black iPhone with a clear case, lost near the Gate 3 entrance',
  contactEmail: 'lena.ortiz@example.com',
} as const;

export const DEMO_ITEM = {
  category: 'phone',
  color: 'black',
  foundArea: 'Gate 3',
  fields: {
    brand: 'Apple',
    model: 'iPhone 14',
    case_description: 'clear case with a green sticker',
    lock_screen: 'golden retriever on a beach',
    damage: 'cracked top-left corner',
  },
} as const;

/** What the claimant types in the demo (deliberately not word-for-word). */
export const DEMO_ANSWERS = {
  model: 'iPhone 14',
  case_description: 'Clear case, green sticker on the back',
  lock_screen: 'My golden retriever on a beach',
  damage: 'Top left corner is cracked',
} as const;
