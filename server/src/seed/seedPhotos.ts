import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SEED_PHOTOS, type SeedPhoto } from './photos/catalog';
import { MODELS, type ItemSpec } from './itemData';
import { pick, type Rng } from './rng';

const DIR = fileURLToPath(new URL('./photos/', import.meta.url));

/**
 * Deterministic photo rotation per category. `avoidColor` skips photos of that color
 * (recently found phones must not be black, so no seeded item matches the scripted demo report).
 */
export function photoPicker() {
  const cursor: Record<string, number> = {};
  return (category: ItemSpec['category'], avoidColor?: string): SeedPhoto => {
    const list = SEED_PHOTOS.filter((p) => p.category === category);
    if (!list.length) throw new Error(`No seed photos for ${category}`);
    for (let tries = 0; tries < list.length; tries++) {
      const photo = list[(cursor[category] = (cursor[category] ?? -1) + 1) % list.length];
      if (photo.color !== avoidColor) return photo;
    }
    throw new Error(`No ${category} seed photo that is not ${avoidColor}`);
  };
}

/** Make the item agree with its picture: same color, phones the brand (with a model of that brand), and a public name. */
export function matchSpecToPhoto(spec: ItemSpec, photo: SeedPhoto, rng: Rng): ItemSpec {
  const fields = { ...spec.fields };
  if (spec.category === 'phone' && photo.brand && fields.brand !== photo.brand) {
    fields.brand = photo.brand;
    fields.model = pick(rng, MODELS[photo.brand] ?? [fields.model]);
  }
  if (spec.category === 'wallet') fields.material = 'Leather';
  const color = photo.color[0].toUpperCase() + photo.color.slice(1);
  const name = spec.category === 'phone'
    ? `${color} ${fields.brand === 'Apple' ? 'iPhone' : `${fields.brand} phone`}`
    : (fields.brand ? `${color} ${fields.brand} wallet` : `${color} leather wallet`);
  return { ...spec, name, color: photo.color, fields };
}

export function readSeedPhoto(photo: SeedPhoto): { data: Buffer; mimetype: string } {
  return { data: fs.readFileSync(DIR + photo.file), mimetype: 'image/jpeg' };
}
