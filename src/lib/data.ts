export type TransactionCategory =
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja'
  | 'Hiburan'
  | 'Kesehatan'
  | 'Gaji'
  | 'Tagihan'
  | 'Tempat Tinggal'
  | 'Pekerjaan Lepas'
  | 'Investasi'
  | 'Lainnya';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: TransactionCategory;
  amount: number;
  type: 'income' | 'expense';
  userId?: string;
};

export const categories: TransactionCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Tagihan',
  'Tempat Tinggal',
  'Lainnya',
];

export const incomeCategories: TransactionCategory[] = [
  'Gaji',
  'Pekerjaan Lepas',
  'Investasi',
  'Lainnya',
];

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
