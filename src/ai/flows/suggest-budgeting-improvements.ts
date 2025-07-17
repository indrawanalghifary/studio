// use server'

/**
 * @fileOverview AI agent that provides suggestions on how to improve budgeting based on financial data.
 *
 * - suggestBudgetingImprovements - A function that provides budgeting improvement suggestions.
 * - SuggestBudgetingImprovementsInput - The input type for the suggestBudgetingImprovements function.
 * - SuggestBudgetingImprovementsOutput - The return type for the suggestBudgetingImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetingImprovementsInputSchema = z.object({
  financialData: z
    .string()
    .describe(
      'A string containing the user financial transaction data, including income, expenses, and categories.'
    ),
});
export type SuggestBudgetingImprovementsInput = z.infer<typeof SuggestBudgetingImprovementsInputSchema>;

const SuggestBudgetingImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'A string containing the suggestions on how to improve budgeting based on the financial data.'
    ),
});
export type SuggestBudgetingImprovementsOutput = z.infer<typeof SuggestBudgetingImprovementsOutputSchema>;

export async function suggestBudgetingImprovements(
  input: SuggestBudgetingImprovementsInput
): Promise<SuggestBudgetingImprovementsOutput> {
  return suggestBudgetingImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetingImprovementsPrompt',
  input: {schema: SuggestBudgetingImprovementsInputSchema},
  output: {schema: SuggestBudgetingImprovementsOutputSchema},
  prompt: `You are a financial advisor specializing in providing budgeting advice. Based on the user's financial data, provide suggestions on how to improve their budgeting.

Financial Data: {{{financialData}}}`,
});

const suggestBudgetingImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetingImprovementsFlow',
    inputSchema: SuggestBudgetingImprovementsInputSchema,
    outputSchema: SuggestBudgetingImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
