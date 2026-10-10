import { defineCategory } from '../schema';

export default defineCategory({
  id: 'keys',
  label: "Keys",
  sensitive: false,
  retentionDays: 60,
  fields: [
    { name: 'key_type', label: "Key type", type: 'select', options: ['House', 'Car', 'Office', 'Other'], public: true, required: true },
    { name: 'brand', label: "Brand (car fob / lock)", public: true, required: false },
    { name: 'keychain', label: "Keychain or fob description", public: false, required: true },
    { name: 'key_count', label: "Number of keys", type: 'number', public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'keychain', question: "Describe the keychain or fob attached.", match: 'contains' },
    { field: 'key_count', question: "How many keys are on the ring?", match: 'exact' },
  ],
});
