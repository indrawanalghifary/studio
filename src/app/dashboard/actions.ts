'use server';

import { analyzeSpendingPatterns } from '@/ai/flows/analyze-spending-patterns';
import type { AnalyzeSpendingPatternsOutput, AnalyzeSpendingPatternsInput } from '@/ai/flows/analyze-spending-patterns';
import { type Transaction } from '@/lib/data';

export async function getFinancialAdvice(transactions: Transaction[]): Promise<AnalyzeSpendingPatternsOutput> {
    const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const transactionsForAI: AnalyzeSpendingPatternsInput['transactions'] = transactions.map(t => ({
        date: new Date(t.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
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
