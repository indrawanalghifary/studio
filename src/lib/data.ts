export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: 'Food & Drinks' | 'Transport' | 'Shopping' | 'Entertainment' | 'Health' | 'Salary' | 'Utilities' | 'Housing' | 'Freelance' | 'Investment' | 'Other';
  amount: number;
  type: 'income' | 'expense';
  userId?: string;
};

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-28', description: 'Monthly Salary', category: 'Salary', amount: 5000, type: 'income' },
  { id: '2', date: '2024-07-25', description: 'Grocery shopping', category: 'Food & Drinks', amount: 75.50, type: 'expense' },
  { id: '3', date: '2024-07-24', description: 'New headphones', category: 'Shopping', amount: 199.99, type: 'expense' },
  { id: '4', date: '2024-07-22', description: 'Train ticket', category: 'Transport', amount: 30.00, type: 'expense' },
  { id: '5', date: '2024-07-20', description: 'Dinner with friends', category: 'Food & Drinks', amount: 50.25, type: 'expense' },
  { id: '6', date: '2024-07-18', description: 'Movie tickets', category: 'Entertainment', amount: 25.00, type: 'expense' },
  { id: '7', date: '2024-07-15', description: 'Electricity bill', category: 'Utilities', amount: 65.00, type: 'expense' },
  { id: '8', date: '2024-07-10', description: 'Pharmacy', category: 'Health', amount: 15.70, type: 'expense' },
  { id: '9', date: '2024-07-05', description: 'Freelance project payment', category: 'Salary', amount: 750, type: 'income' },
  { id: '10', date: '2024-07-01', description: 'Rent', category: 'Housing', amount: 1200, type: 'expense' },
];

export const categories = ['Food & Drinks', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Housing', 'Other'];
export const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other'];

export const categoryIcons: Record<string, string> = {
  'Food & Drinks': 'utensils-crossed',
  'Transport': 'bus',
  'Shopping': 'shopping-bag',
  'Entertainment': 'popcorn',
  'Health': 'heart-pulse',
  'Salary': 'landmark',
  'Freelance': 'briefcase',
  'Investment': 'trending-up',
  'Utilities': 'lightbulb',
  'Housing': 'home',
  'Other': 'shapes'
};
