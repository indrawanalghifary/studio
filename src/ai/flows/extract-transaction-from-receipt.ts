'use server';

/**
 * @fileOverview Extracts transaction details from a receipt image.
 * 
 * - extractTransactionFromReceipt - A function that handles the receipt analysis process.
 * - ExtractTransactionFromReceiptInput - The input type for the extractTransactionFromReceipt function.
 * - ExtractTransactionFromReceiptOutput - The return type for the extractTransactionFromReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { categories, incomeCategories } from '@/lib/data';

const ExtractTransactionFromReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionFromReceiptInput = z.infer<typeof ExtractTransactionFromReceiptInputSchema>;

const ExtractTransactionFromReceiptOutputSchema = z.object({
    amount: z.number().describe('The total amount of the transaction. Find the grand total.'),
    category: z.string().describe(`The category of the transaction. Choose from the following list: ${[...categories, ...incomeCategories].join(', ')}`),
    date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
    description: z.string().describe('A short description of the transaction, usually the name of the store or merchant.'),
    type: z.enum(['income', 'expense']).describe('The type of transaction. Most receipts are expenses.'),
});
export type ExtractTransactionFromReceiptOutput = z.infer<typeof ExtractTransactionFromReceiptOutputSchema>;

export async function extractTransactionFromReceipt(input: ExtractTransactionFromReceiptInput): Promise<ExtractTransactionFromReceiptOutput> {
    return extractTransactionFromReceiptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractTransactionFromReceiptPrompt',
    input: { schema: ExtractTransactionFromReceiptInputSchema },
    output: { schema: ExtractTransactionFromReceiptOutputSchema },
    prompt: `You are an expert receipt scanner. Analyze the provided receipt image and extract the transaction details.

- Identify the merchant name and use it as the description.
- Find the final total amount of the transaction.
- Determine the date of the transaction.
- Categorize the transaction based on the items or merchant name. The transaction is most likely an 'expense'.
- Based on the content, determine if it is an 'income' or 'expense' transaction.

Return the data in the specified JSON format.

Receipt Image: {{media url=photoDataUri}}`,
});

const extractTransactionFromReceiptFlow = ai.defineFlow(
  {
    name: 'extractTransactionFromReceiptFlow',
    inputSchema: ExtractTransactionFromReceiptInputSchema,
    outputSchema: ExtractTransactionFromReceiptOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
