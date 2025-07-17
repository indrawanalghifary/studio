'use client';

import * as React from 'react';
import type { Transaction } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TopCategoriesProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export function TopCategories({ transactions }: TopCategoriesProps) {
  const { topExpenses, topIncomes, totalExpenses, totalIncomes } = React.useMemo(() => {
    const categoryTotals = transactions.reduce((acc, t) => {
      if (!acc[t.type]) {
        acc[t.type] = {};
      }
      if (!acc[t.type][t.category]) {
        acc[t.type][t.category] = 0;
      }
      acc[t.type][t.category] += t.amount;
      return acc;
    }, {} as Record<'expense' | 'income', Record<string, number>>);

    const sortAndSlice = (categoryMap: Record<string, number> | undefined) => {
        if (!categoryMap) return [];
        return Object.entries(categoryMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Show top 5
    };
    
    const topExpenses = sortAndSlice(categoryTotals.expense);
    const topIncomes = sortAndSlice(categoryTotals.income);

    const totalExpenses = topExpenses.reduce((sum, [, amount]) => sum + amount, 0);
    const totalIncomes = topIncomes.reduce((sum, [, amount]) => sum + amount, 0);

    return { topExpenses, topIncomes, totalExpenses, totalIncomes };
  }, [transactions]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Top Pengeluaran</CardTitle>
          <CardDescription>5 kategori pengeluaran teratas periode ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {topExpenses.length > 0 ? (
            <div className="space-y-4">
              {topExpenses.map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                  </div>
                  <Progress value={(amount / totalExpenses) * 100} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data pengeluaran untuk ditampilkan.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Top Pemasukan</CardTitle>
          <CardDescription>5 kategori pemasukan teratas periode ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {topIncomes.length > 0 ? (
            <div className="space-y-4">
              {topIncomes.map(([category, amount]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                  </div>
                  <Progress value={(amount / totalIncomes) * 100} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data pemasukan untuk ditampilkan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
