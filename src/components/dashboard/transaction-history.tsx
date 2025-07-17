'use client';

import { useState, useMemo } from "react";
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
import type { DateRange } from "react-day-picker";
import { TransactionFilters } from "./transaction-filters";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

type IconName = keyof typeof icons;

function DynamicIcon({ name }: { name: string }) {
    const LucideIcon = icons[name as IconName] as Icon;
    if (!LucideIcon) return <icons.Shapes className="h-5 w-5" />;
    return <LucideIcon className="h-5 w-5" />;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TRANSACTIONS_PER_PAGE = 10;

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const { categories: userCategories, loading: loadingCategories } = useCategories();

  const allCategories = useMemo(() => {
    const combined = [...userCategories.expense, ...userCategories.income];
    return [...new Set(combined)]; // Remove duplicates
  }, [userCategories]);
  
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const isDateInRange = !dateRange || (
        (!dateRange.from || transactionDate >= dateRange.from) &&
        (!dateRange.to || transactionDate <= dateRange.to)
      );
      const isCategoryMatch = !category || transaction.category === category;
      return isDateInRange && isCategoryMatch;
    });
    // Reset to first page whenever filters change
    setCurrentPage(1);
    return filtered;
  }, [transactions, dateRange, category]);
  
  const { totalIncome, totalExpenses, netTotal } = useMemo(() => {
    const totals = filteredTransactions.reduce((acc, t) => {
        if (t.type === 'income') {
            acc.income += t.amount;
        } else {
            acc.expense += t.amount;
        }
        return acc;
    }, { income: 0, expense: 0 });

    return {
        totalIncome: totals.income,
        totalExpenses: totals.expense,
        netTotal: totals.income - totals.expense,
    };
  }, [filteredTransactions]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

  const handleResetFilters = () => {
    setDateRange(undefined);
    setCategory(undefined);
    setCurrentPage(1);
  };
  
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
         <TransactionFilters
            dateRange={dateRange}
            onDateChange={setDateRange}
            category={category}
            onCategoryChange={setCategory}
            onReset={handleResetFilters}
            categories={allCategories}
            isLoading={loadingCategories}
         />
         <div className="mt-4 rounded-md border">
            <ScrollArea className="h-[500px]">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="text-center hidden md:table-cell">Kategori</TableHead>
                            <TableHead className="text-center hidden sm:table-cell">Tanggal</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Tidak ada transaksi yang cocok dengan filter Anda.
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 sm:flex bg-primary/10 text-primary rounded-md hidden">
                                            <AvatarFallback className="rounded-md bg-transparent">
                                            <DynamicIcon name={categoryIcons[transaction.category] || 'Shapes'} />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{transaction.description}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">{transaction.category}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center hidden md:table-cell">
                                    <Badge variant="outline">{transaction.category}</Badge>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground hidden sm:table-cell">{format(new Date(transaction.date), 'd MMM yyyy', { locale: id })}</TableCell>
                                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
         </div>
         <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Selanjutnya
                </Button>
            </div>
        </div>
        
        <Separator className="my-4" />

        <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-8 text-right px-2">
            <div>
                <div className="text-sm text-muted-foreground">Total Pemasukan (Difilter)</div>
                <div className="text-lg font-bold text-green-500">{formatCurrency(totalIncome)}</div>
            </div>
            <div>
                <div className="text-sm text-muted-foreground">Total Pengeluaran (Difilter)</div>
                <div className="text-lg font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
            </div>
             <div>
                <div className="text-sm text-muted-foreground">Total Bersih (Difilter)</div>
                <div className={`text-lg font-bold ${netTotal >= 0 ? 'text-foreground' : 'text-destructive'}`}>{formatCurrency(netTotal)}</div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
