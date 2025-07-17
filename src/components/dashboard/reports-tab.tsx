import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingBreakdownChart } from "./spending-breakdown-chart";
import { AIAdvisor } from "./ai-advisor";
import { Transaction } from "@/lib/data";

interface ReportsTabProps {
  transactions: Transaction[];
}

export function ReportsTab({ transactions }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Rincian Pengeluaran</CardTitle>
          <CardDescription>Grafik ini menunjukkan pengeluaran Anda berdasarkan kategori untuk bulan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <SpendingBreakdownChart transactions={transactions} />
        </CardContent>
      </Card>
      <AIAdvisor transactions={transactions} />
    </div>
  );
}
