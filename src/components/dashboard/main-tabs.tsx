import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTransactionForm } from "./add-transaction-form";
import { ReportsTab } from "./reports-tab";
import { PlusCircle, LineChart } from "lucide-react";

export function MainTabs() {
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
        <AddTransactionForm />
      </TabsContent>
      <TabsContent value="reports">
        <ReportsTab />
      </TabsContent>
    </Tabs>
  );
}
