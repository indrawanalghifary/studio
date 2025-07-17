// This file contains the logic to seed data, but is not executable directly.
// It's imported by `scripts/seed.js` which is the executable script.

const { Timestamp } = require('firebase-admin/firestore');
// Import Firestore as a type
const { Firestore } = require('firebase-admin/firestore'); // This import is for the *value* of Firestore, not the type itself. We'll use 'typeof Firestore' for the type annotation.

const dummyTransactions = (userId: string) => [
  // Expenses
 {
    amount: 50000,
    category: 'Makanan & Minuman',
    date: Timestamp.fromDate(new Date('2024-05-01')),
    description: 'Makan siang di warteg',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 150000,
    category: 'Transportasi',
    date: Timestamp.fromDate(new Date('2024-05-01')),
    description: 'Bensin motor',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 350000,
    category: 'Belanja',
    date: Timestamp.fromDate(new Date('2024-05-03')),
    description: 'Beli baju baru',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 250000,
    category: 'Hiburan',
    date: Timestamp.fromDate(new Date('2024-05-05')),
    description: 'Nonton bioskop',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 75000,
    category: 'Kesehatan',
    date: Timestamp.fromDate(new Date('2024-05-08')),
    description: 'Beli obat batuk',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 500000,
    category: 'Tagihan',
    date: Timestamp.fromDate(new Date('2024-05-10')),
    description: 'Bayar tagihan listrik',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 1200000,
    category: 'Tempat Tinggal',
    date: Timestamp.fromDate(new Date('2024-05-12')),
    description: 'Bayar sewa kos',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 100000,
    category: 'Lainnya',
    date: Timestamp.fromDate(new Date('2024-05-15')),
    description: 'Donasi',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 65000,
    category: 'Makanan & Minuman',
    date: Timestamp.fromDate(new Date('2024-05-18')),
    description: 'Kopi dan cemilan',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 200000,
    category: 'Belanja',
    date: Timestamp.fromDate(new Date('2024-05-20')),
    description: 'Belanja bulanan',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  // Additional Expenses - April 2024
 {
    amount: 40000,
    category: 'Makanan & Minuman',
    date: Timestamp.fromDate(new Date('2024-04-05')),
    description: 'Sarapan di kafe',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 180000,
    category: 'Transportasi',
    date: Timestamp.fromDate(new Date('2024-04-10')),
    description: 'Tiket kereta',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 500000,
    category: 'Belanja',
    date: Timestamp.fromDate(new Date('2024-04-15')),
    description: 'Beli sepatu',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 300000,
    category: 'Hiburan',
    date: Timestamp.fromDate(new Date('2024-04-20')),
    description: 'Konser musik',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 100000,
    category: 'Kesehatan',
    date: Timestamp.fromDate(new Date('2024-04-25')),
    description: 'Vitamin',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
   // Additional Expenses - June 2024
 {
    amount: 55000,
    category: 'Makanan & Minuman',
    date: Timestamp.fromDate(new Date('2024-06-02')),
    description: 'Makan malam',
    type: 'expense',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  // Income
  {
    amount: 5000000,
    category: 'Gaji',
    date: Timestamp.fromDate(new Date('2024-05-25')),
    description: 'Gaji bulan Mei',
    type: 'income',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 1500000,
    category: 'Pekerjaan Lepas',
    date: Timestamp.fromDate(new Date('2024-05-15')),
    description: 'Proyek desain logo',
    type: 'income',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  {
    amount: 250000,
    category: 'Investasi',
    date: Timestamp.fromDate(new Date('2024-05-28')),
    description: 'Dividen saham',
    type: 'income',
    userId: userId,
    createdAt: Timestamp.now(),
  },
   // Additional Income - April 2024
  {
    amount: 3000000,
    category: 'Pekerjaan Lepas',
    date: Timestamp.fromDate(new Date('2024-04-28')),
    description: 'Proyek penulisan konten',
    type: 'income',
    userId: userId,
    createdAt: Timestamp.now(),
  },
  // Additional Income - June 2024
  {
    amount: 5200000,
  },
];

async function seedTransactions(db: typeof Firestore, userId: string) {
  const transactionsCollection = db.collection('transactions');
  const transactions = dummyTransactions(userId);

  const batch = db.batch();

  transactions.forEach(transaction => {
    const docRef = transactionsCollection.doc(); // Automatically generate a new document ID
    batch.set(docRef, transaction);
  });

  await batch.commit();
  console.log(`Successfully seeded ${transactions.length} transactions for user ${userId}.`);
}

module.exports = { seedTransactions };
