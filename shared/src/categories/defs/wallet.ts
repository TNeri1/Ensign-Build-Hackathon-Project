import { defineCategory } from '../schema';

export default defineCategory({
  id: 'wallet',
  label: 'Wallet',
  sensitive: true, // wallets usually hold IDs and cards
  retentionDays: 60,
  fields: [
    { name: 'brand', label: 'Brand (if visible)', type: 'text', public: true, required: false },
    { name: 'material', label: 'Material', type: 'select', options: ['Leather', 'Fabric', 'Plastic', 'Other'], public: true, required: true },
    { name: 'name_on_card', label: 'Name on a card or ID', type: 'text', public: false, required: true },
    { name: 'cash_amount', label: 'Approx. cash inside', type: 'number', public: false, required: false },
    { name: 'distinct_contents', label: 'Distinctive contents', type: 'text', public: false, required: false },
    { name: 'card_count', label: 'Number of cards', type: 'number', public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'name_on_card', question: 'What name is on the cards inside?', match: 'contains' },
    { field: 'cash_amount', question: 'Roughly how much cash was inside?', match: 'exact' },
    { field: 'distinct_contents', question: 'Name something distinctive inside the wallet.', match: 'contains' },
    { field: 'card_count', question: 'How many cards were in the wallet?', match: 'exact' },
  ],
});
