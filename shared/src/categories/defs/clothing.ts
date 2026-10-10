import { defineCategory } from '../schema';

export default defineCategory({
  id: 'clothing',
  label: "Clothing",
  sensitive: false,
  retentionDays: 60,
  fields: [
    { name: 'garment', label: "Garment", type: 'select', options: ['Jacket', 'Sweater', 'Shirt', 'Pants', 'Hat', 'Scarf', 'Shoes', 'Other'], public: true, required: true },
    { name: 'size', label: "Size", public: true, required: false },
    { name: 'brand', label: "Brand label", public: false, required: true },
    { name: 'pocket_contents', label: "What is in the pockets", public: false, required: false },
    { name: 'marking', label: "Name tag, stain or damage", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'brand', question: "What brand label is on it?", match: 'contains' },
    { field: 'pocket_contents', question: "What was in the pocket?", match: 'contains' },
    { field: 'marking', question: "Describe any name tag, stain or damage.", match: 'contains' },
  ],
});
