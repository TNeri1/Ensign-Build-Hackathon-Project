import { defineCategory } from '../schema';

export default defineCategory({
  id: 'phone',
  label: 'Phone',
  sensitive: false,
  retentionDays: 90,
  fields: [
    { name: 'brand', label: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Google', 'Motorola', 'Other'], public: true, required: true },
    { name: 'model', label: 'Model', type: 'text', public: false, required: true },
    { name: 'case_description', label: 'Case (color/style)', type: 'text', public: false, required: false },
    { name: 'lock_screen', label: 'Lock screen / wallpaper', type: 'text', public: false, required: false },
    { name: 'damage', label: 'Visible damage', type: 'text', public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'model', question: 'What model is the phone?', match: 'contains' },
    { field: 'case_description', question: 'Describe the phone case.', match: 'contains' },
    { field: 'lock_screen', question: 'What is shown on the lock screen wallpaper?', match: 'contains' },
    { field: 'damage', question: 'Describe any scratches or cracks on the phone.', match: 'contains' },
  ],
});
