import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingBreakdownChart } from "./spending-breakdown-chart";
import { AIAdvisor } from "./ai-advisor";

export function ReportsTab() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Spending Breakdown</CardTitle>
          <CardDescription>This chart shows your expenses by category for this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <SpendingBreakdownChart />
        </CardContent>
      </Card>
      <AIAdvisor />
    </div>
  );
}
