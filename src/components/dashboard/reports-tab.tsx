import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingBreakdownChart } from "./spending-breakdown-chart";
import { AIAdvisor } from "./ai-advisor";
import { Transaction } from "@/lib/data";
import { IncomeExpenseChart } from "./income-expense-chart";
import { IncomeBreakdownChart } from "./income-breakdown-chart";

interface ReportsTabProps {
  transactions: Transaction[];
}

export function ReportsTab({ transactions }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tren Keuangan</CardTitle>
          <CardDescription>Perbandingan pemasukan dan pengeluaran Anda dari waktu ke waktu.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeExpenseChart transactions={transactions} />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rincian Pengeluaran</CardTitle>
            <CardDescription>Distribusi pengeluaran Anda berdasarkan kategori.</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingBreakdownChart transactions={transactions} />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rincian Pemasukan</CardTitle>
            <CardDescription>Distribusi pemasukan Anda berdasarkan sumber.</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeBreakdownChart transactions={transactions} />
          </CardContent>
        </Card>
      </div>

      <AIAdvisor transactions={transactions} />
    </div>
  );
}
