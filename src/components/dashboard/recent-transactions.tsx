'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { categoryIcons, type Transaction } from "@/lib/data";
import { Icon } from "lucide-react";
import * as icons from "lucide-react";
import { id } from 'date-fns/locale';
import { format } from 'date-fns';
import { ScrollArea } from "../ui/scroll-area";

type IconName = keyof typeof icons;

function DynamicIcon({ name }: { name: string }) {
    const LucideIcon = icons[name as IconName] as Icon;
    if (!LucideIcon) return <icons.Shapes className="h-5 w-5" />;
    return <LucideIcon className="h-5 w-5" />;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 10);
  
  const formatCurrency = (amount: number, type: 'income' | 'expense') => {
    const value = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    return type === 'income' ? `+${value}` : `-${value}`;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Transaksi Terkini</CardTitle>
        <CardDescription>10 aktivitas keuangan terbaru Anda.</CardDescription>
      </CardHeader>
      <CardContent>
         <ScrollArea className="h-[400px]">
            <div className="grid gap-6 pr-4">
              {recent.length === 0 && <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>}
              {recent.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4">
                  <Avatar className="hidden h-10 w-10 sm:flex bg-primary/10 text-primary">
                    <AvatarFallback>
                      <DynamicIcon name={categoryIcons[transaction.category] || 'Shapes'} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.category} &bull; {format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}</p>
                  </div>
                  <div className={`ml-auto text-sm font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(transaction.amount, transaction.type)}
                  </div>
                </div>
              ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
