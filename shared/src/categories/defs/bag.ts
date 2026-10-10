import { defineCategory } from '../schema';

export default defineCategory({
  id: 'bag',
  label: "Bag",
  sensitive: false,
  retentionDays: 90,
  fields: [
    { name: 'bag_type', label: "Bag type", type: 'select', options: ['Backpack', 'Handbag', 'Tote', 'Duffel', 'Other'], public: true, required: true },
    { name: 'brand', label: "Brand", public: true, required: false },
    { name: 'contents', label: "Contents (two items)", public: false, required: true },
    { name: 'marking', label: "Tag, patch or marking", public: false, required: false },
    { name: 'tag_name', label: "Name on luggage tag", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'contents', question: "Name two items inside the bag.", match: 'contains' },
    { field: 'marking', question: "Describe any tag, patch or marking on the bag.", match: 'contains' },
    { field: 'tag_name', question: "What name is on the luggage tag?", match: 'contains' },
  ],
});
