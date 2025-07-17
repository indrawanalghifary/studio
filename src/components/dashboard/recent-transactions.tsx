'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockTransactions, categoryIcons } from "@/lib/data";
import { Icon } from "lucide-react";
import * as icons from "lucide-react";

type IconName = keyof typeof icons;

function DynamicIcon({ name }: { name: string }) {
    const LucideIcon = icons[name as IconName] as Icon;
    if (!LucideIcon) return <icons.Shapes className="h-5 w-5" />;
    return <LucideIcon className="h-5 w-5" />;
}

export function RecentTransactions() {
  const recent = mockTransactions.slice(0, 5);
  
  const formatCurrency = (amount: number, type: 'income' | 'expense') => {
    const value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    return type === 'income' ? `+${value}` : `-${value}`;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A quick look at your latest financial moves.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recent.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4">
            <Avatar className="hidden h-10 w-10 sm:flex bg-primary/10 text-primary">
              <AvatarFallback>
                <DynamicIcon name={categoryIcons[transaction.category] || 'Shapes'} />
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">{transaction.category} &bull; {new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div className={`ml-auto font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(transaction.amount, transaction.type)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
