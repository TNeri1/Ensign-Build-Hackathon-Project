import { defineCategory } from '../schema';

export default defineCategory({
  id: 'laptop',
  label: "Laptop",
  sensitive: false,
  retentionDays: 90,
  fields: [
    { name: 'brand', label: "Brand", type: 'select', options: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', 'Other'], public: true, required: true },
    { name: 'screen_size', label: "Screen size (inches)", type: 'number', public: true, required: false },
    { name: 'model', label: "Model", public: false, required: true },
    { name: 'serial_suffix', label: "Last 4 of serial number", public: false, required: false },
    { name: 'stickers', label: "Stickers or decals", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'model', question: "What model is the laptop?", match: 'contains' },
    { field: 'serial_suffix', question: "What are the last four characters of the serial number?", match: 'exact' },
    { field: 'stickers', question: "Describe any stickers or decals on the lid.", match: 'contains' },
  ],
});
