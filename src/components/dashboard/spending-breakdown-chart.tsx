'use client'

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { mockTransactions } from "@/lib/data"

const chartConfig = {
  amount: {
    label: "Amount",
  },
  'Food & Drinks': {
    label: 'Food & Drinks',
    color: 'hsl(var(--chart-1))',
  },
  'Transport': {
    label: 'Transport',
    color: 'hsl(var(--chart-2))',
  },
  'Shopping': {
    label: 'Shopping',
    color: 'hsl(var(--chart-3))',
  },
  'Entertainment': {
    label: 'Entertainment',
    color: 'hsl(var(--chart-4))',
  },
  'Health': {
    label: 'Health',
    color: 'hsl(var(--chart-5))',
  },
   'Utilities': {
    label: 'Utilities',
    color: 'hsl(var(--chart-1))',
    },
    'Housing': {
    label: 'Housing',
    color: 'hsl(var(--chart-2))',
    },
    'Other': {
    label: 'Other',
    color: 'hsl(var(--chart-3))',
    },
}

export function SpendingBreakdownChart() {
  const chartData = React.useMemo(() => {
    const expenseData = mockTransactions.filter(t => t.type === 'expense');
    const categoryTotals = expenseData.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      fill: chartConfig[category as keyof typeof chartConfig]?.color || 'hsl(var(--chart-5))',
    }));
  }, []);

  const totalExpenses = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData]);
  
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
           <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalExpenses.toLocaleString("en-US", { style: "currency", currency: "USD"})}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Expenses
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
