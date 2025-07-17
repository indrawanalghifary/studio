'use server';

/**
 * @fileOverview Provides personalized financial insights and recommendations based on spending patterns and income.
 *
 * - analyzeSpendingPatterns - Analyzes spending patterns and income to provide financial advice.
 * - AnalyzeSpendingPatternsInput - The input type for the analyzeSpendingPatterns function.
 * - AnalyzeSpendingPatternsOutput - The return type for the analyzeSpendingPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  date: z.string().describe('The date of the transaction (YYYY-MM-DD).'),
  description: z.string().describe('A description of the transaction.'),
  amount: z.number().describe('The amount of the transaction.'),
  type: z.enum(['income', 'expense']).describe('The type of transaction.'),
  category: z.string().describe('The category of the transaction.'),
});

const AnalyzeSpendingPatternsInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of transactions.'),
  income: z.number().describe('The total income of the user.'),
});

export type AnalyzeSpendingPatternsInput = z.infer<typeof AnalyzeSpendingPatternsInputSchema>;

const AnalyzeSpendingPatternsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and recommendations on how to improve financial health.'),
});

export type AnalyzeSpendingPatternsOutput = z.infer<typeof AnalyzeSpendingPatternsOutputSchema>;

export async function analyzeSpendingPatterns(input: AnalyzeSpendingPatternsInput): Promise<AnalyzeSpendingPatternsOutput> {
  return analyzeSpendingPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSpendingPatternsPrompt',
  input: {schema: AnalyzeSpendingPatternsInputSchema},
  output: {schema: AnalyzeSpendingPatternsOutputSchema},
  prompt: `You are a personal financial advisor. Analyze the user's spending patterns and income to provide personalized insights and recommendations on how to improve their financial health.

Here is the user's total income: {{income}}

Here are the user's transactions:
{{#each transactions}}
  - Date: {{date}}, Description: {{description}}, Amount: {{amount}}, Type: {{type}}, Category: {{category}}
{{/each}}

Provide insights and recommendations in a clear and concise manner.
`,
});

const analyzeSpendingPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeSpendingPatternsFlow',
    inputSchema: AnalyzeSpendingPatternsInputSchema,
    outputSchema: AnalyzeSpendingPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
