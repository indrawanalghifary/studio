export type TransactionCategory = string; // Now a generic string

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: TransactionCategory;
  amount: number;
  type: 'income' | 'expense';
  userId?: string;
  createdAt?: string;
};

// These are now default categories for new users or users who haven't customized them.
export const defaultExpenseCategories: TransactionCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Tagihan',
  'Tempat Tinggal',
  'Lainnya',
];

export const defaultIncomeCategories: TransactionCategory[] = [
  'Gaji',
  'Pekerjaan Lepas',
  'Investasi',
  'Lainnya',
];

// Deprecated, use dynamic categories from Firestore
export const categories = defaultExpenseCategories;
export const incomeCategories = defaultIncomeCategories;


export const categoryIcons: Record<string, string> = {
  'Makanan & Minuman': 'UtensilsCrossed',
  'Transportasi': 'Bus',
  'Belanja': 'ShoppingBag',
  'Hiburan': 'Popcorn',
  'Kesehatan': 'HeartPulse',
  'Gaji': 'Landmark',
  'Pekerjaan Lepas': 'Briefcase',
  'Investasi': 'TrendingUp',
  'Tagihan': 'Lightbulb',
  'Tempat Tinggal': 'Home',
  'Lainnya': 'Shapes'
};
