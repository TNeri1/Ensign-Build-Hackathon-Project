import { COLORS, type CategoryRegistry } from '@vlf/shared';

/**
 * System prompt for the vision model, generated from the category plugins so new categories work automatically.
 * The model must answer with ONE JSON object; sanitize.ts validates it against the registry.
 */
export function buildVisionPrompt(reg: CategoryRegistry): string {
  const cats = reg.all().map((c) => {
    const fields = c.fields
      .map((f) => {
        const kind = f.type === 'select' ? `one of: ${f.options?.join(' | ')}` : f.type === 'number' ? 'a number' : 'short text';
        return `    - "${f.name}" (${f.label}): ${kind}`;
      })
      .join('\n');
    return `  * "${c.id}" (${c.label})\n${fields}`;
  });
  return [
    'You help lost-and-found staff log a found item from a photo.',
    'Reply with ONE JSON object and nothing else, shaped like:',
    '{"category": "<category id>", "name": "<short item name>", "color": "<color>", "fields": {"<field name>": "<value>"}, "summary": "<one short sentence>"}',
    '"name" is a short, generic public name for the item, 1-4 words, e.g. "iPhone", "Leather wallet", "AirPods case". It is shown publicly: never include names of people, card or serial numbers, or other details only the owner would know.',
    '',
    `Allowed colors (pick the item's main color): ${COLORS.join(', ')}.`,
    'Categories and their fields:',
    ...cats,
    '',
    'Rules:',
    '- Only describe what is clearly visible. Leave a field out instead of guessing.',
    '- Use the exact category id and field names above. For "one of" fields use one of the listed options exactly.',
    '- Keep each value short (a few words). Numbers as plain digits.',
    reg.has('other')
      ? '- Prefer the most specific category. If none fits (e.g. earbuds when there is no headphones category, an umbrella, a toy), use "other" and make "name" say what it is, like "AirPods case". Never put an item in a category it does not belong to.'
      : '- If the item fits no category, omit "category" and "fields" and just give "color" and "summary". Never put an item in a category it does not belong to.',
  ].join('\n');
}
