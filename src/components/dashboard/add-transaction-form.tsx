'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addTransaction } from "@/lib/firestore";
import type { ExtractTransactionFromReceiptOutput } from "@/ai/flows/extract-transaction-from-receipt";
import { useCategories } from "@/hooks/use-categories";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive({ message: "Jumlah harus positif." }),
  category: z.string().min(1, { message: "Silakan pilih kategori." }),
  date: z.date(),
  description: z.string().min(1, { message: "Deskripsi wajib diisi." }),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  transactionType: 'income' | 'expense';
  onFormSubmit: () => void;
}

export function AddTransactionForm({ transactionType, onFormSubmit }: AddTransactionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { categories: userCategories, loading: loadingCategories } = useCategories();
  
  const currentCategoryList = transactionType === 'expense' ? userCategories.expense : userCategories.income;

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: transactionType,
      amount: 0,
      category: '',
      date: new Date(),
      description: '',
    },
  });

  // Effect to handle data from receipt scan
  useEffect(() => {
    const handleScanComplete = (event: Event) => {
        const customEvent = event as CustomEvent<ExtractTransactionFromReceiptOutput>;
        const result = customEvent.detail;
        
        // Only update form if the scan result type matches the current form type
        if (result.type !== transactionType) {
            toast({
                title: "Jenis Transaksi Tidak Cocok",
                description: `Hasil pindaian adalah ${result.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}, tetapi formulir ini untuk ${transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}.`,
                variant: 'destructive',
            });
            return;
        }

        form.setValue('amount', result.amount);
        form.setValue('description', result.description);
        form.setValue('date', new Date(result.date));
        form.setValue('type', result.type);
        
        const availableCategories = result.type === 'expense' ? userCategories.expense : userCategories.income;
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
  }, [form, toast, transactionType, userCategories]);
  
  async function onSubmit(values: FormSchemaType) {
    setIsLoading(true);
    try {
      const newTransaction = { ...values, createdAt: new Date() };
      await addTransaction(newTransaction as any); // TODO: Fix type
      toast({
        title: "Transaksi ditambahkan",
        description: `Berhasil menambahkan ${values.type === 'income' ? 'pemasukan' : 'pengeluaran'}.`,
        variant: "default",
        className: "bg-accent text-accent-foreground"
      });
      onFormSubmit(); // Close dialog on success
      form.reset();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
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
                <Select onValueChange={field.onChange} value={field.value} disabled={loadingCategories}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Memuat kategori..." : "Pilih kategori"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currentCategoryList.map((cat) => (
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
        
        <Button type="submit" className="w-full" disabled={isLoading || loadingCategories}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
          Simpan Transaksi
        </Button>
      </form>
    </Form>
  );
}
