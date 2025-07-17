'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/data";
import { ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { useMemo } from "react";

interface SummaryCardsProps {
  transactions: Transaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const { income, expenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">Saldo Anda saat ini</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">Total pemasukan bulan ini</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
          <ArrowDownLeft className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(expenses)}</div>
          <p className="text-xs text-muted-foreground">Total pengeluaran bulan ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
