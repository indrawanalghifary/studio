'use client';

import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Transaction } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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

    // Sort by date and take the last 30 days of data points
    return Object.values(dataByDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  }, [transactions]);
  
  if(chartData.length === 0) {
      return (
        <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tren Keuangan</CardTitle>
              <CardDescription>Perbandingan pemasukan dan pengeluaran Anda dari waktu ke waktu.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">Belum ada data transaksi.</p>
                    <p className="text-sm text-muted-foreground">Tambahkan transaksi untuk melihat tren.</p>
                </div>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="shadow-lg">
        <CardHeader>
            <CardTitle>Tren Keuangan</CardTitle>
            <CardDescription>Perbandingan pemasukan dan pengeluaran Anda dari waktu ke waktu.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <LineChart
                data={chartData}
                margin={{
                top: 10,
                right: 20,
                left: 20,
                bottom: 10,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
                cursor={true}
                content={<ChartTooltipContent
                    labelFormatter={(label) => format(new Date(label), 'eeee, d MMM yyyy', { locale: id })}
                    formatter={(value, name) => (
                        <div className="flex items-center">
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                marginRight: '8px',
                                backgroundColor: chartConfig[name as keyof typeof chartConfig].color,
                            }}></div>
                            <span className="capitalize mr-2">{chartConfig[name as keyof typeof chartConfig].label}:</span>
                            <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value as number)}</span>
                        </div>
                    )}
                    />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8, className: "shadow-md" }}
                />
                <Line
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8, className: "shadow-md" }}
                />
            </LineChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
