/**
 * Real photos for the seed data, VENDORED (no network at runtime). GENERATED; see ATTRIBUTION.md.
 * All CC0 or Public Domain (found via Openverse). Each photo's category and color are hand-checked,
 * so a seeded item takes its color from its photo.
 */
/** brand: set when the photo clearly shows one (iPhone -> Apple), so the seeded details match the picture. */
export interface SeedPhoto { file: string; category: 'phone' | 'wallet'; color: string; brand?: string }

export const SEED_PHOTOS: SeedPhoto[] = [
  { file: 'phone-white-1.jpg', category: 'phone', brand: 'Apple', color: 'white' },
  { file: 'phone-white-2.jpg', category: 'phone', brand: 'Apple', color: 'white' },
  { file: 'phone-white-3.jpg', category: 'phone', brand: 'Apple', color: 'white' },
  { file: 'phone-black-1.jpg', category: 'phone', brand: 'Apple', color: 'black' },
  { file: 'phone-black-2.jpg', category: 'phone', brand: 'Apple', color: 'black' },
  { file: 'phone-black-3.jpg', category: 'phone', color: 'black' },
  { file: 'phone-black-4.jpg', category: 'phone', brand: 'Apple', color: 'black' },
  { file: 'phone-silver-1.jpg', category: 'phone', brand: 'Samsung', color: 'silver' },
  { file: 'phone-silver-2.jpg', category: 'phone', brand: 'Apple', color: 'silver' },
  { file: 'phone-silver-3.jpg', category: 'phone', brand: 'Apple', color: 'silver' },
  { file: 'phone-gold-1.jpg', category: 'phone', brand: 'Apple', color: 'gold' },
  { file: 'phone-black-5.jpg', category: 'phone', brand: 'Apple', color: 'black' },
  { file: 'phone-red-1.jpg', category: 'phone', brand: 'Apple', color: 'red' },
  { file: 'phone-purple-1.jpg', category: 'phone', brand: 'Apple', color: 'purple' },
  { file: 'phone-green-1.jpg', category: 'phone', brand: 'Apple', color: 'green' },
  { file: 'wallet-black-1.jpg', category: 'wallet', color: 'black' },
  { file: 'wallet-black-2.jpg', category: 'wallet', color: 'black' },
  { file: 'wallet-black-3.jpg', category: 'wallet', color: 'black' },
  { file: 'wallet-black-4.jpg', category: 'wallet', color: 'black' },
  { file: 'wallet-black-5.jpg', category: 'wallet', color: 'black' },
  { file: 'wallet-brown-1.jpg', category: 'wallet', color: 'brown' },
  { file: 'wallet-brown-2.jpg', category: 'wallet', color: 'brown' },
  { file: 'wallet-brown-3.jpg', category: 'wallet', color: 'brown' },
  { file: 'wallet-gray-1.jpg', category: 'wallet', color: 'gray' },
];
