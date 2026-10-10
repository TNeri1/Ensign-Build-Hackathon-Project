import { defineCategory } from '../schema';

export default defineCategory({
  id: 'water_bottle',
  label: "Water bottle",
  sensitive: false,
  retentionDays: 45,
  fields: [
    { name: 'material', label: "Material", type: 'select', options: ['Stainless steel', 'Plastic', 'Glass', 'Other'], public: true, required: true },
    { name: 'brand', label: "Brand", public: true, required: false },
    { name: 'stickers', label: "Stickers or decals", public: false, required: true },
    { name: 'damage', label: "Dents or damage", public: false, required: false },
    { name: 'name_label', label: "Name written on it", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'stickers', question: "Describe the stickers or decals on the bottle.", match: 'contains' },
    { field: 'damage', question: "Describe any dents or damage.", match: 'contains' },
    { field: 'name_label', question: "Is a name written on the bottle? What is it?", match: 'contains' },
  ],
});
