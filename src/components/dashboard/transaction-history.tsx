'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { categoryIcons, type Transaction } from "@/lib/data";
import { Icon } from "lucide-react";
import * as icons from "lucide-react";
import { id } from 'date-fns/locale';
import { format } from 'date-fns';
import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

type IconName = keyof typeof icons;

function DynamicIcon({ name }: { name: string }) {
    const LucideIcon = icons[name as IconName] as Icon;
    if (!LucideIcon) return <icons.Shapes className="h-5 w-5" />;
    return <LucideIcon className="h-5 w-5" />;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <Card className="shadow-lg mt-4">
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
        <CardDescription>Seluruh catatan pemasukan dan pengeluaran Anda.</CardDescription>
      </CardHeader>
      <CardContent>
         <ScrollArea className="h-[600px]">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-center">Kategori</TableHead>
                        <TableHead className="text-center">Tanggal</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {transactions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                Belum ada transaksi.
                            </TableCell>
                        </TableRow>
                     )}
                     {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="hidden h-10 w-10 sm:flex bg-primary/10 text-primary rounded-md">
                                        <AvatarFallback className="rounded-md bg-transparent">
                                        <DynamicIcon name={categoryIcons[transaction.category] || 'Shapes'} />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{transaction.description}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline">{transaction.category}</Badge>
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">{format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}</TableCell>
                            <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </TableCell>
                        </TableRow>
                     ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
