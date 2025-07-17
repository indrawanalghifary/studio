'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Transaction } from '@/lib/data';

const chartConfig = {
  income: {
    label: 'Pemasukan',
    color: 'hsl(var(--chart-2))',
  },
  expense: {
    label: 'Pengeluaran',
    color: 'hsl(var(--chart-1))',
  },
};

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: IncomeExpenseChartProps) {
  const chartData = React.useMemo(() => {
    const dataByDate = transactions.reduce((acc, t) => {
      const date = format(new Date(t.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += t.amount;
      } else {
        acc[date].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    // Sort by date and take the last 30 days
    return Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [transactions]);
  
  if(chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Belum ada data transaksi.</p>
            <p className="text-sm text-muted-foreground">Tambahkan transaksi untuk melihat tren.</p>
        </div>
      )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => format(new Date(value), 'd MMM', { locale: id })}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) =>
                new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                }).format(value as number)
            }
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent
            labelFormatter={(label) => format(new Date(label), 'eeee, d MMM yyyy', { locale: id })}
            formatter={(value, name) => (
                <div className="flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mr-2 bg-[${chartConfig[name as keyof typeof chartConfig].color}]`}></div>
                    <span className="capitalize mr-2">{chartConfig[name as keyof typeof chartConfig].label}:</span>
                    <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)}</span>
                </div>
            )}
             />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
