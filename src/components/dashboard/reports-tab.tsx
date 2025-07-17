import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpendingBreakdownChart } from "./spending-breakdown-chart";
import { AIAdvisor } from "./ai-advisor";
import { Transaction } from "@/lib/data";
import { IncomeExpenseChart } from "./income-expense-chart";
import { IncomeBreakdownChart } from "./income-breakdown-chart";
import { TransactionHistory } from "./transaction-history";


interface ReportsTabProps {
  transactions: Transaction[];
}

export function ReportsTab({ transactions }: ReportsTabProps) {
  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="reports">Laporan</TabsTrigger>
        <TabsTrigger value="history">Riwayat</TabsTrigger>
      </TabsList>
      <TabsContent value="reports">
        <div className="space-y-6 mt-4">
          <IncomeExpenseChart transactions={transactions} />
          
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
      </TabsContent>
      <TabsContent value="history">
         <TransactionHistory transactions={transactions} />
      </TabsContent>
    </Tabs>
  );
}
