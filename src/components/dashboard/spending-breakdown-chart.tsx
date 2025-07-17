'use client'

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import type { Transaction } from "@/lib/data";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  amount: {
    label: "Jumlah",
  },
  'Makanan & Minuman': {
    label: 'Makanan & Minuman',
    color: 'hsl(var(--chart-1))',
  },
  'Transportasi': {
    label: 'Transportasi',
    color: 'hsl(var(--chart-2))',
  },
  'Belanja': {
    label: 'Belanja',
    color: 'hsl(var(--chart-3))',
  },
  'Hiburan': {
    label: 'Hiburan',
    color: 'hsl(var(--chart-4))',
  },
  'Kesehatan': {
    label: 'Kesehatan',
    color: 'hsl(var(--chart-5))',
  },
   'Tagihan': {
    label: 'Tagihan',
    color: 'hsl(var(--chart-1))',
    },
    'Tempat Tinggal': {
    label: 'Tempat Tinggal',
    color: 'hsl(var(--chart-2))',
    },
    'Lainnya': {
    label: 'Lainnya',
    color: 'hsl(var(--chart-3))',
    },
}

interface SpendingBreakdownChartProps {
  transactions: Transaction[];
}

export function SpendingBreakdownChart({ transactions }: SpendingBreakdownChartProps) {
  const chartData = React.useMemo(() => {
    const expenseData = transactions.filter(t => t.type === 'expense');
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
  }, [transactions]);

  const totalExpenses = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Belum ada data pengeluaran untuk bulan ini.</p>
        <p className="text-sm text-muted-foreground">Tambahkan pengeluaran untuk melihat rinciannya.</p>
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)} />}
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
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalExpenses)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Pengeluaran
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
