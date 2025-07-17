'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionFiltersProps {
  dateRange: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  category: string | undefined;
  onCategoryChange: (category: string | undefined) => void;
  onReset: () => void;
  categories: string[];
}

export function TransactionFilters({
  dateRange,
  onDateChange,
  category,
  onCategoryChange,
  onReset,
  categories,
}: TransactionFiltersProps) {
  const isFiltered = dateRange?.from || dateRange?.to || category;
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-card">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={'outline'}
              className={cn(
                'w-full md:w-[300px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'd LLL, yy', { locale: id })} -{' '}
                    {format(dateRange.to, 'd LLL, yy', { locale: id })}
                  </>
                ) : (
                  format(dateRange.from, 'd LLL, yy', { locale: id })
                )
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateChange}
              numberOfMonths={2}
              locale={id}
            />
          </PopoverContent>
        </Popover>

        <Select
            value={category}
            onValueChange={(value) => onCategoryChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-full md:w-[240px]">
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
            <Button onClick={onReset} variant="ghost" className="w-full md:w-auto">
                <X className="mr-2 h-4 w-4" />
                Reset
            </Button>
        )}
    </div>
  );
}
