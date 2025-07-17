'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { getFinancialAdvice } from '@/app/dashboard/actions';

export function AIAdvisor() {
  const [advice, setAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setError(null);
    setAdvice('');
    try {
      const result = await getFinancialAdvice();
      setAdvice(result.insights);
    } catch (e) {
      setError('Failed to get advice. Please try again.');
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
          <CardTitle>AI Financial Advisor</CardTitle>
        </div>
        <CardDescription>Get personalized insights and recommendations to improve your financial health.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Analyzing your spending...</p>
          </div>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {advice && <p className="text-sm text-foreground/80 whitespace-pre-wrap">{advice}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetAdvice} disabled={isLoading} className="w-full">
          {isLoading ? 'Thinking...' : 'Generate My Financial Insights'}
        </Button>
      </CardFooter>
    </Card>
  );
}
