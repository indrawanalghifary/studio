'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categoryIcons, type Transaction } from "@/lib/data";
import * as icons from "lucide-react";
import { Icon } from "lucide-react";
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

type IconName = keyof typeof icons;

function DynamicIcon({ name }: { name: string }) {
    const LucideIcon = icons[name as IconName] as Icon;
    if (!LucideIcon) return <icons.Shapes className="h-4 w-4" />;
    return <LucideIcon className="h-4 w-4" />;
}

interface TopCategoriesProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export function TopCategories({ transactions }: TopCategoriesProps) {
  const { topExpenses, topIncomes } = useMemo(() => {
    const categoryTotals = (type: 'expense' | 'income') =>
      transactions
        .filter(t => t.type === type)
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

    const sortedCategories = (totals: Record<string, number>) =>
      Object.entries(totals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const expenseTotals = categoryTotals('expense');
    const incomeTotals = categoryTotals('income');

    return {
      topExpenses: sortedCategories(expenseTotals),
      topIncomes: sortedCategories(incomeTotals),
    };
  }, [transactions]);
  
  const maxExpense = topExpenses[0]?.[1] || 1;
  const maxIncome = topIncomes[0]?.[1] || 1;

  const renderCategoryList = (
    data: [string, number][],
    maxAmount: number,
    type: 'expense' | 'income'
  ) => {
    if (data.length === 0) {
      return <p className="text-sm text-muted-foreground px-2">Belum ada data.</p>;
    }
    return data.map(([category, amount]) => (
        <div key={category} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    <DynamicIcon name={categoryIcons[category] || 'Shapes'} />
                    <span className="font-medium">{category}</span>
                </div>
                <span className={`font-semibold ${type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(amount)}
                </span>
            </div>
            <Progress value={(amount / maxAmount) * 100} className="h-2" />
        </div>
    ));
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Kategori Teratas</CardTitle>
        <CardDescription>Pemasukan dan pengeluaran terbanyak Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-22rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pr-4">
              <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Top Pengeluaran <Badge variant="destructive">Top 10</Badge>
                  </h3>
                  <div className="space-y-4">
                      {renderCategoryList(topExpenses, maxExpense, 'expense')}
                  </div>
              </div>
              <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      Top Pemasukan <Badge className="bg-green-500 hover:bg-green-600">Top 10</Badge>
                  </h3>
                  <div className="space-y-4">
                      {renderCategoryList(topIncomes, maxIncome, 'income')}
                  </div>
              </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
