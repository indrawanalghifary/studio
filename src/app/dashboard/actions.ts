'use server';

import { analyzeSpendingPatterns } from '@/ai/flows/analyze-spending-patterns';
import type { AnalyzeSpendingPatternsOutput, AnalyzeSpendingPatternsInput } from '@/ai/flows/analyze-spending-patterns';
import { mockTransactions } from '@/lib/data';

export async function getFinancialAdvice(): Promise<AnalyzeSpendingPatternsOutput> {
    const income = mockTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const transactionsForAI: AnalyzeSpendingPatternsInput['transactions'] = mockTransactions.map(t => ({
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
    }));

    const input: AnalyzeSpendingPatternsInput = {
        transactions: transactionsForAI,
        income,
    };

    try {
        const result = await analyzeSpendingPatterns(input);
        return result;
    } catch (error) {
        console.error("Error getting financial advice:", error);
        throw new Error("Failed to retrieve financial advice from AI.");
    }
}
