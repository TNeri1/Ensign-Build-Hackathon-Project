import { defineCategory } from '../schema';

/**
 * Catch-all for anything no specific category covers (an AirPods case, an umbrella, a toy).
 * The item's own name (required here, e.g. "AirPods case") is its heading everywhere. The photo reader picks this when nothing fits.
 * Matching for "other" relies on color, area and time only, so claims still need staff verification.
 */

export default defineCategory({
  id: 'other',
  label: "Other",
  sensitive: false,
  retentionDays: 60,
  nameRequired: true,
  fields: [
    { name: 'brand', label: "Brand (if visible)", public: true, required: false },
    { name: 'description', label: "Description (size, material, condition)", public: false, required: true },
    { name: 'distinguishing_marks', label: "Distinguishing marks (stickers, engraving, damage)", public: false, required: false },
    { name: 'contents', label: "Contents (if it holds anything)", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'description', question: "Describe the item: size, material, condition.", match: 'contains' },
    { field: 'distinguishing_marks', question: "Describe any stickers, engravings or damage on it.", match: 'contains' },
    { field: 'contents', question: "What was inside it, if anything?", match: 'contains' },
  ],
});
