import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionForm } from "./add-transaction-form";
import { ReportsTab } from "./reports-tab";
import { PlusCircle, LineChart } from "lucide-react";
import type { Transaction } from "@/lib/data";

interface MainTabsProps {
  onTransactionAdded: (transaction: Omit<Transaction, 'id'>) => void;
  transactions: Transaction[];
}

export function MainTabs({ onTransactionAdded, transactions }: MainTabsProps) {
  return (
    <Tabs defaultValue="add_transaction">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="add_transaction">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </TabsTrigger>
        <TabsTrigger value="reports">
          <LineChart className="mr-2 h-4 w-4" />
          Reports & AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="add_transaction">
        <AddTransactionForm onTransactionAdded={onTransactionAdded} />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsTab transactions={transactions} />
      </TabsContent>
    </Tabs>
  );
}
