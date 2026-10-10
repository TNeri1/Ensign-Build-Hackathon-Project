import { defineCategory } from '../schema';

export default defineCategory({
  id: 'headphones',
  label: "Headphones",
  sensitive: false,
  retentionDays: 60,
  fields: [
    { name: 'style', label: "Style", type: 'select', options: ['Over-ear', 'On-ear', 'Earbuds', 'Other'], public: true, required: true },
    { name: 'brand', label: "Brand", public: true, required: false },
    { name: 'model', label: "Model", public: false, required: true },
    { name: 'case_description', label: "Case description", public: false, required: false },
    { name: 'engraving', label: "Engraving or marking", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'model', question: "What model are the headphones?", match: 'contains' },
    { field: 'case_description', question: "Describe the carrying case, if any.", match: 'contains' },
    { field: 'engraving', question: "Is there an engraving or marking? What does it say?", match: 'contains' },
  ],
});
