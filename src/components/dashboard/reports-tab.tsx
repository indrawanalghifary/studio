
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingBreakdownChart } from "./spending-breakdown-chart";
import { AIAdvisor } from "./ai-advisor";
import { Transaction } from "@/lib/data";
import { IncomeExpenseChart } from "./income-expense-chart";
import { IncomeBreakdownChart } from "./income-breakdown-chart";
import { TransactionHistory } from "./transaction-history";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TopCategories } from './top-categories';

interface ReportsTabProps {
  transactions: Transaction[];
}

const generateYearOptions = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    return [new Date().getFullYear()];
  }
  const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
  const currentYear = new Date().getFullYear();
  years.add(currentYear);
  return Array.from(years).sort((a, b) => b - a);
};

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function ReportsTab({ transactions }: ReportsTabProps) {
  const [currentTab, setCurrentTab] = useState('reports');
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear()); // -1 for all
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11 for Jan-Dec, -1 for all

  const yearOptions = useMemo(() => generateYearOptions(transactions), [transactions]);

  const filteredTransactions = useMemo(() => {
    if (currentTab !== 'reports') return transactions;

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      // -1 means all years
      const yearMatch = selectedYear === -1 || transactionDate.getFullYear() === selectedYear;
      // -1 means all months
      const monthMatch = selectedMonth === -1 || transactionDate.getMonth() === selectedMonth;
      return yearMatch && monthMatch;
    });
  }, [transactions, selectedYear, selectedMonth, currentTab]);


  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="reports">Laporan</TabsTrigger>
        <TabsTrigger value="history">Riwayat</TabsTrigger>
      </TabsList>
      <TabsContent value="reports">
        <div className="space-y-6 mt-4">
          
          <Card>
            <CardHeader>
              <CardTitle>Filter Laporan</CardTitle>
              <CardDescription>Pilih periode untuk menampilkan laporan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={String(selectedMonth)}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Pilih Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Semua Bulan</SelectItem>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(selectedYear)}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="-1">Semua Tahun</SelectItem>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </CardContent>
          </Card>

          <IncomeExpenseChart transactions={filteredTransactions} />
          
          <TopCategories transactions={filteredTransactions} />

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Rincian Pengeluaran</CardTitle>
                <CardDescription>Distribusi pengeluaran Anda berdasarkan kategori.</CardDescription>
              </CardHeader>
              <CardContent>
                <SpendingBreakdownChart transactions={filteredTransactions} />
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Rincian Pemasukan</CardTitle>
                <CardDescription>Distribusi pemasukan Anda berdasarkan sumber.</CardDescription>
              </CardHeader>
              <CardContent>
                <IncomeBreakdownChart transactions={filteredTransactions} />
              </CardContent>
            </Card>
          </div>

          <AIAdvisor transactions={filteredTransactions} />
        </div>
      </TabsContent>
      <TabsContent value="history">
         <TransactionHistory transactions={transactions} />
      </TabsContent>
    </Tabs>
  );
}
