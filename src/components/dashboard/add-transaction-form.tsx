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
import { Input } from "@/components/ui/input"; // Assuming this is your Shadcn UI Input
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
  initialData?: ExtractTransactionFromReceiptOutput | null;
}

export function AddTransactionForm({ transactionType, onFormSubmit, initialData }: AddTransactionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // State to hold the displayed amount with separators
  const [displayAmount, setDisplayAmount] = useState('');


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
    if (!initialData) return;
    
    // Only update form if the scan result type matches the current form type
    if (initialData.type !== transactionType) {
        toast({
            title: "Jenis Transaksi Tidak Cocok",
            description: `Hasil pindaian adalah ${initialData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}, tetapi formulir ini untuk ${transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}. Silakan coba lagi.`,
            variant: 'destructive',
        });
        return;
    }

    // Set the form value for submission
    form.setValue('amount', initialData.amount);
    // Format the amount for display in the input field
    setDisplayAmount(formatNumberWithDots(initialData.amount));
    form.setValue('description', initialData.description);
    // Ensure date is a valid Date object
    const scannedDate = new Date(initialData.date);
    form.setValue('date', isNaN(scannedDate.getTime()) ? new Date() : scannedDate);
    form.setValue('type', initialData.type);
    
    const availableCategories = initialData.type === 'expense' ? userCategories.expense : userCategories.income;
    if (availableCategories.includes(initialData.category)) {
        form.setValue('category', initialData.category);
    } else {
        form.setValue('category', 'Lainnya');
    }

    toast({
        title: "Pindai Selesai",
        description: "Formulir telah diisi dengan data dari struk.",
        variant: 'default',
        className: "bg-accent text-accent-foreground"
    });
  }, [initialData, form, toast, transactionType, userCategories]);
  
  // Helper function to format number with dots as thousand separators
  const formatNumberWithDots = (value: number | string): string => {
    // Remove non-digit characters first
    const num = String(value).replace(/\D/g, '');
    if (num === '') return '';
    // Add dots as thousand separators
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Handle amount input change
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/\D/g, ''); // Remove non-digits for the actual value
    const formattedValue = formatNumberWithDots(rawValue); // Format for display

    setDisplayAmount(formattedValue);
    // Update react-hook-form value with the raw number (or 0 if empty)
    form.setValue('amount', rawValue === '' ? 0 : parseFloat(rawValue));
  };

  // Manually handle blur to re-format if needed (optional, but good for consistency)
  const handleAmountBlur = () => {
      const rawValue = form.getValues('amount');
      if (rawValue !== 0) {
          setDisplayAmount(formatNumberWithDots(rawValue));
      }
  };

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
                  <Input
                    type="text" // Use text type to allow dots while typing
                    placeholder="0"
                    value={displayAmount} // Bind input value to the formatted state
                    onChange={handleAmountChange} // Use custom change handler
                  />
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
                <Textarea 
                  placeholder={transactionType === 'income' ? 'cth: Gaji bulanan' : 'cth: Kopi dengan teman'} 
                  {...field} 
                />
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
