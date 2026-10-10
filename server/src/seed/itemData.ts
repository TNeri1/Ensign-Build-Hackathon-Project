import { pick, between, type Rng } from './rng';

export const AREAS = ['Gate 3', 'Gate 7', 'Food Court', 'Section 112', 'Parking Lot B', 'Main Lobby', 'Restrooms L2', 'Box Office', 'VIP Lounge'] as const;
const PHONE_COLORS = ['black', 'black', 'white', 'silver', 'blue', 'red', 'gold'] as const;
const WALLET_COLORS = ['brown', 'black', 'brown', 'blue', 'gray'] as const;

export const MODELS: Record<string, string[]> = {
  Apple: ['iPhone 12', 'iPhone 13', 'iPhone 15 Pro'],
  Samsung: ['Galaxy S22', 'Galaxy S23', 'Galaxy A54'],
  Google: ['Pixel 7', 'Pixel 8'],
  Motorola: ['Moto G Power'],
};
const CASES = ['clear case', 'black rubber case', 'red leather folio', 'blue glitter case', 'no case'];
const LOCK_SCREENS = ['mountain sunrise', 'two kids at a beach', 'city skyline at night', 'default blue swirl', 'cat in a sweater'];
const DAMAGE = ['cracked top-left corner', 'scratched screen', 'dented frame', 'cracked back glass'];
const NAMES = ['Priya Raman', 'Marcus Webb', 'Elena Petrova', 'Tom Okafor', 'Aisha Khan', 'Diego Ramirez', 'Chloe Martin', 'Ben Fischer'];
const CONTENTS = ['Starbucks gift card', 'library card', 'folded concert ticket', 'loyalty stamp card', 'photo of a dog', 'transit pass'];

export interface ItemSpec {
  category: 'phone' | 'wallet';
  /** Public heading name ("iPhone"); set from the photo in seedPhotos.ts. */
  name?: string;
  color: string;
  area: string;
  fields: Record<string, string>;
}

/** `recent` items (found in the last day) are never black, so no seeded item can match the demo report. */
export function randomPhone(rng: Rng, recent = false): ItemSpec {
  const brand = pick(rng, Object.keys(MODELS));
  let color: string = pick(rng, PHONE_COLORS);
  let area: string = pick(rng, AREAS);
  // Keep the scripted demo clean: no seeded phone at Gate 3, and no recent black phone.
  if (area === 'Gate 3') area = 'Gate 7';
  if (recent && color === 'black') color = 'silver';
  return {
    category: 'phone', color, area,
    fields: { brand, model: pick(rng, MODELS[brand]), case_description: pick(rng, CASES), lock_screen: pick(rng, LOCK_SCREENS), damage: pick(rng, DAMAGE) },
  };
}

export function randomWallet(rng: Rng): ItemSpec {
  return {
    category: 'wallet',
    color: pick(rng, WALLET_COLORS),
    area: pick(rng, AREAS),
    fields: {
      brand: pick(rng, ['Fossil', 'Herschel', 'Coach', '']),
      material: pick(rng, ['Leather', 'Fabric', 'Leather']),
      name_on_card: pick(rng, NAMES),
      cash_amount: String(between(rng, 0, 12) * 5),
      distinct_contents: pick(rng, CONTENTS),
      card_count: String(between(rng, 2, 7)),
    },
  };
}
