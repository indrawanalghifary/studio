import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import type { Transaction } from './data';
import { defaultExpenseCategories, defaultIncomeCategories } from './data';

type NewTransaction = Omit<Transaction, 'id' | 'date' | 'createdAt'> & {
  date: Date;
  createdAt: Date;
};

export const addTransaction = async (transactionData: NewTransaction) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is signed in.');
  }

  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId: user.uid,
      // serverTimestamp() is more reliable as it uses the server's time
      createdAt: serverTimestamp(), 
      date: Timestamp.fromDate(transactionData.date),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error('Failed to add transaction.');
  }
};

// --- Category Management ---

export interface UserCategories {
  expense: string[];
  income: string[];
}

export const getUserCategories = async (): Promise<UserCategories> => {
  const user = auth.currentUser;
  if (!user) {
    // Return default categories if no user is logged in
    return { expense: defaultExpenseCategories, income: defaultIncomeCategories };
  }

  const userSettingsDocRef = doc(db, 'user_settings', user.uid);
  const docSnap = await getDoc(userSettingsDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      expense: data.expenseCategories || defaultExpenseCategories,
      income: data.incomeCategories || defaultIncomeCategories,
    };
  } else {
    // If user has no settings, return defaults
    return { expense: defaultExpenseCategories, income: defaultIncomeCategories };
  }
};

export const saveUserCategories = async (categories: UserCategories) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is signed in.');
  }

  const userSettingsDocRef = doc(db, 'user_settings', user.uid);
  try {
    await setDoc(userSettingsDocRef, {
      expenseCategories: categories.expense,
      incomeCategories: categories.income,
    });
  } catch (error) {
    console.error('Error saving categories: ', error);
    throw new Error('Failed to save categories.');
  }
};
