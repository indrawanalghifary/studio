import { db, auth } from './firebase';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Transaction } from './data';

type NewTransaction = Omit<Transaction, 'id' | 'date'> & {
  date: Date;
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
      createdAt: serverTimestamp(),
      date: Timestamp.fromDate(transactionData.date),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error('Failed to add transaction.');
  }
};
