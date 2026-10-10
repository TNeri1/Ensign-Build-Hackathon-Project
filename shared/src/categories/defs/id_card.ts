import { defineCategory } from '../schema';

export default defineCategory({
  id: 'id_card',
  label: "ID card",
  sensitive: true,
  retentionDays: 30,
  fields: [
    { name: 'card_type', label: "Card type", type: 'select', options: ['Driver license', 'Student ID', 'Employee badge', 'Passport', 'Other'], public: true, required: true },
    { name: 'holder_name', label: "Name on card", public: false, required: true },
    { name: 'id_last4', label: "Last 4 characters of ID number", public: false, required: true },
    { name: 'date_of_birth', label: "Date of birth (YYYY-MM-DD)", public: false, required: false },
    { name: 'issuer', label: "Issuer (school, employer, state)", public: false, required: false },
  ],
  challengeTemplates: [
    { field: 'holder_name', question: "What name is on the card?", match: 'contains' },
    { field: 'id_last4', question: "What are the last four characters of the ID number?", match: 'exact' },
    { field: 'date_of_birth', question: "What is the date of birth on the card (YYYY-MM-DD)?", match: 'exact' },
    { field: 'issuer', question: "Who issued the card?", match: 'contains' },
  ],
});
