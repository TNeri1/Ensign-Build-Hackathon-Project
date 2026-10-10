import { defineCategory } from '../schema';

export default defineCategory({
  id: 'payment_card',
  label: "Payment card",
  sensitive: true,
  retentionDays: 30,
  fields: [
    { name: 'card_network', label: "Card network", type: 'select', options: ['Visa', 'Mastercard', 'Amex', 'Discover', 'Other'], public: true, required: true },
    { name: 'card_kind', label: "Card kind", type: 'select', options: ['Credit', 'Debit', 'Gift'], public: true, required: false },
    { name: 'last4', label: "Last 4 digits", public: false, required: true },
    { name: 'cardholder_name', label: "Cardholder name", public: false, required: true },
    { name: 'issuing_bank', label: "Issuing bank", public: false, required: true },
  ],
  challengeTemplates: [
    { field: 'last4', question: "What are the last four digits of the card number?", match: 'exact' },
    { field: 'cardholder_name', question: "What name is printed on the card?", match: 'contains' },
    { field: 'issuing_bank', question: "Which bank issued the card?", match: 'contains' },
  ],
});
