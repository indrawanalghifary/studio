'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Upload, ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { categories, incomeCategories, type Transaction } from "@/lib/data";
import { addTransaction } from "@/lib/firestore";
import type { ExtractTransactionFromReceiptOutput } from "@/ai/flows/extract-transaction-from-receipt";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
  category: z.string().min(1, { message: "Silakan pilih kategori." }),
  date: z.date(),
  description: z.string().min(1, { message: "Deskripsi wajib diisi." }),
});

interface AddTransactionFormProps {
  onTransactionAdded: (transaction: Omit<Transaction, 'id'>) => void;
}

export function AddTransactionForm({ onTransactionAdded }: AddTransactionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      category: '',
      date: new Date(),
      description: '',
    },
  });

  useEffect(() => {
    const handleScanComplete = (event: Event) => {
        const customEvent = event as CustomEvent<ExtractTransactionFromReceiptOutput>;
        const result = customEvent.detail;
        
        form.setValue('amount', result.amount);
        form.setValue('description', result.description);
        form.setValue('date', new Date(result.date));
        form.setValue('type', result.type);
        if(result.type === 'income') {
            setTransactionType('income');
        } else {
            setTransactionType('expense');
        }
        
        const availableCategories = result.type === 'expense' ? categories : incomeCategories;
        if (availableCategories.includes(result.category)) {
            form.setValue('category', result.category);
        } else {
            form.setValue('category', 'Lainnya');
        }

        toast({
            title: "Pindai Selesai",
            description: "Formulir telah diisi dengan data dari struk.",
            variant: 'default',
            className: "bg-accent text-accent-foreground"
        });
    };

    window.addEventListener('scanComplete', handleScanComplete);

    return () => {
        window.removeEventListener('scanComplete', handleScanComplete);
    };
  }, [form, toast]);
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const newTransaction = { ...values, createdAt: new Date() };
      await addTransaction(newTransaction);
      toast({
        title: "Transaksi ditambahkan",
        description: `Berhasil menambahkan ${values.type === 'income' ? 'pemasukan' : 'pengeluaran'} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(values.amount)}.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
      form.reset({ 
          type: transactionType,
          amount: 0,
          category: '',
          date: new Date(),
          description: '',
       });
    } catch (error) {
       toast({
        title: "Error",
        description: "Gagal menambahkan transaksi. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Catat Transaksi Baru</CardTitle>
        <CardDescription>Isi detail di bawah ini untuk menambahkan catatan keuangan baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <ToggleGroup
                      type="single"
                      value={transactionType}
                      className="grid grid-cols-2"
                      onValueChange={(value: 'income' | 'expense') => {
                        if (value) {
                            field.onChange(value);
                            setTransactionType(value);
                            form.setValue('category', '');
                        }
                      }}
                    >
                      <ToggleGroupItem value="expense" aria-label="Toggle expense" className="data-[state=on]:bg-red-100 data-[state=on]:text-red-600">
                        Pengeluaran
                      </ToggleGroupItem>
                      <ToggleGroupItem value="income" aria-label="Toggle income" className="data-[state=on]:bg-green-100 data-[state=on]:text-green-600">
                        Pemasukan
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(transactionType === 'expense' ? categories : incomeCategories).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={id}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="cth: Kopi dengan teman" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
              Tambah Transaksi
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
