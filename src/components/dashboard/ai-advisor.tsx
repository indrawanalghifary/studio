'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { getFinancialAdvice } from '@/app/dashboard/actions';
import { Transaction } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AIAdvisorProps {
  transactions: Transaction[];
}

export function AIAdvisor({ transactions }: AIAdvisorProps) {
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetAdvice = async () => {
    if (transactions.length === 0) {
      toast({
        title: "Data Tidak Cukup",
        description: "Silakan tambahkan beberapa transaksi terlebih dahulu untuk mendapatkan saran keuangan.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAdvice('');
    try {
      const result = await getFinancialAdvice(transactions);
      setAdvice(result.insights);
    } catch (e) {
      setError('Gagal mendapatkan saran. Silakan coba lagi.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle>Penasihat Keuangan AI</CardTitle>
        </div>
        <CardDescription>Dapatkan wawasan dan rekomendasi yang dipersonalisasi untuk meningkatkan kesehatan keuangan Anda.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Menganalisis pengeluaran Anda...</p>
          </div>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {advice && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{advice}</p>}
         {!advice && !isLoading && !error && (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Klik tombol di bawah untuk menghasilkan wawasan.</p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetAdvice} disabled={isLoading} className="w-full">
          {isLoading ? 'Berpikir...' : 'Hasilkan Wawasan Keuangan Saya'}
        </Button>
      </CardFooter>
    </Card>
  );
}
