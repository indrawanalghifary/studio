// SummarizeMonthlyFinances story
'use server';
/**
 * @fileOverview Summarizes monthly financial data and provides advice using Gemini AI.
 *
 * - summarizeMonthlyFinances - A function that summarizes financial data and provides advice.
 * - SummarizeMonthlyFinancesInput - The input type for the summarizeMonthlyFinances function.
 * - SummarizeMonthlyFinancesOutput - The return type for the summarizeMonthlyFinances function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMonthlyFinancesInputSchema = z.object({
  income: z.number().describe('Total income for the month.'),
  expenses: z.number().describe('Total expenses for the month.'),
  transactions: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    date: z.string(),
    description: z.string().optional(),
  })).describe('List of transactions for the month.'),
});
export type SummarizeMonthlyFinancesInput = z.infer<typeof SummarizeMonthlyFinancesInputSchema>;

const SummarizeMonthlyFinancesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the monthly income and expenses.'),
  advice: z.string().describe('AI-generated advice on saving money based on the financial data.'),
});
export type SummarizeMonthlyFinancesOutput = z.infer<typeof SummarizeMonthlyFinancesOutputSchema>;

export async function summarizeMonthlyFinances(input: SummarizeMonthlyFinancesInput): Promise<SummarizeMonthlyFinancesOutput> {
  return summarizeMonthlyFinancesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMonthlyFinancesPrompt',
  input: {schema: SummarizeMonthlyFinancesInputSchema},
  output: {schema: SummarizeMonthlyFinancesOutputSchema},
  prompt: `You are a personal financial advisor. Please provide a concise summary of the user's monthly financial data, including total income, total expenses, and a list of transactions. Then, provide AI-generated advice on saving money based on the financial data. 

Here's the monthly financial data:

Total Income: {{income}}
Total Expenses: {{expenses}}
Transactions:
{{#each transactions}}
  - Category: {{category}}, Amount: {{amount}}, Date: {{date}}{{#if description}}, Description: {{description}}{{/if}}
{{/each}}`,
});

const summarizeMonthlyFinancesFlow = ai.defineFlow(
  {
    name: 'summarizeMonthlyFinancesFlow',
    inputSchema: SummarizeMonthlyFinancesInputSchema,
    outputSchema: SummarizeMonthlyFinancesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
