'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { saveUserCategories, UserCategories } from '@/lib/firestore';
import { useCategories } from '@/hooks/use-categories';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface CategorySettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategorySettingsDialog({ isOpen, onOpenChange }: CategorySettingsDialogProps) {
  const { categories: initialCategories, loading, mutate } = useCategories();
  const [categories, setCategories] = useState<UserCategories>({ expense: [], income: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newIncomeCategory, setNewIncomeCategory] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && initialCategories) {
      setCategories(JSON.parse(JSON.stringify(initialCategories))); // Deep copy
    }
  }, [loading, initialCategories, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveUserCategories(categories);
      toast({
        title: 'Sukses',
        description: 'Kategori Anda berhasil disimpan.',
        className: 'bg-accent text-accent-foreground',
      });
      mutate(); // Re-fetch categories globally
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan kategori. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (type: 'expense' | 'income', index: number, value: string) => {
    const updatedCategories = { ...categories };
    updatedCategories[type][index] = value;
    setCategories(updatedCategories);
  };

  const handleAddCategory = (type: 'expense' | 'income') => {
    const updatedCategories = { ...categories };
    const newValue = type === 'expense' ? newExpenseCategory : newIncomeCategory;
    if (newValue.trim() && !updatedCategories[type].includes(newValue.trim())) {
      updatedCategories[type].push(newValue.trim());
      setCategories(updatedCategories);
      if (type === 'expense') setNewExpenseCategory('');
      else setNewIncomeCategory('');
    }
  };

  const handleRemoveCategory = (type: 'expense' | 'income', index: number) => {
    const updatedCategories = { ...categories };
    updatedCategories[type].splice(index, 1);
    setCategories(updatedCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pengaturan Kategori</DialogTitle>
          <DialogDescription>
            Kelola kategori pemasukan dan pengeluaran Anda.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                <TabsTrigger value="income">Pemasukan</TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
                <CategoryList
                    type="expense"
                    categories={categories.expense}
                    onCategoryChange={handleCategoryChange}
                    onRemoveCategory={handleRemoveCategory}
                    newCategory={newExpenseCategory}
                    setNewCategory={setNewExpenseCategory}
                    onAddCategory={() => handleAddCategory('expense')}
                    loading={loading}
                />
            </TabsContent>
            <TabsContent value="income">
                 <CategoryList
                    type="income"
                    categories={categories.income}
                    onCategoryChange={handleCategoryChange}
                    onRemoveCategory={handleRemoveCategory}
                    newCategory={newIncomeCategory}
                    setNewCategory={setNewIncomeCategory}
                    onAddCategory={() => handleAddCategory('income')}
                    loading={loading}
                />
            </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving || loading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


interface CategoryListProps {
    type: 'expense' | 'income';
    categories: string[];
    onCategoryChange: (type: 'expense' | 'income', index: number, value: string) => void;
    onRemoveCategory: (type: 'expense' | 'income', index: number) => void;
    newCategory: string;
    setNewCategory: (value: string) => void;
    onAddCategory: () => void;
    loading: boolean;
}

function CategoryList({ categories, type, onCategoryChange, onRemoveCategory, newCategory, setNewCategory, onAddCategory, loading }: CategoryListProps) {
    if (loading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    return (
        <div className="space-y-4 py-4">
             <ScrollArea className="h-64 pr-4">
                <div className="space-y-2">
                {categories.map((category, index) => (
                    <div key={`${type}-${index}`} className="flex items-center gap-2">
                        <Input
                            value={category}
                            onChange={(e) => onCategoryChange(type, index, e.target.value)}
                            className="flex-grow"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveCategory(type, index)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                </div>
            </ScrollArea>
            <div className="flex items-center gap-2 pt-4 border-t">
                <Input
                    placeholder="Tambah kategori baru"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onAddCategory()}
                    className="flex-grow"
                />
                <Button variant="outline" size="icon" onClick={onAddCategory}>
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
