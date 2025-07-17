'use client';

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Transaction } from "@/lib/data";
import { DashboardHeader } from "@/components/dashboard/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TransactionFab } from "@/components/dashboard/transaction-fab";
import { ReportsTab } from "@/components/dashboard/reports-tab";

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setIsDataLoading(true);
      const q = query(
        collection(db, "transactions"), 
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userTransactions: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userTransactions.push({ 
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
           } as Transaction);
        });
        
        // Sort on the client side to avoid composite index requirement
        userTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(userTransactions);
        setIsDataLoading(false);
      }, (error) => {
        console.error("Error fetching transactions: ", error);
        setIsDataLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  if (loading || isDataLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat data keuangan Anda...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SummaryCards transactions={transactions} />
        <ReportsTab transactions={transactions} />
      </main>
      <TransactionFab />
    </div>
  );
}
