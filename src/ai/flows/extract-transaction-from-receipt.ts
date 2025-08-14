'use server';

/**
 * @fileOverview Extracts transaction details from a receipt image.
 * 
 * - extractTransactionFromReceipt - A function that handles the receipt analysis process.
 * - ExtractTransactionFromReceiptInput - The input type for the extractTransactionFromReceipt function.
 * - ExtractTransactionFromReceiptOutput - The return type for the extractTransactionFromReceipt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { defaultExpenseCategories, defaultIncomeCategories } from '@/lib/data';

const ExtractTransactionFromReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionFromReceiptInput = z.infer<typeof ExtractTransactionFromReceiptInputSchema>;

const allCategories = [...defaultExpenseCategories, ...defaultIncomeCategories].filter((value, index, self) => self.indexOf(value) === index);

const ExtractTransactionFromReceiptOutputSchema = z.object({
    amount: z.number().describe('Jumlah total transaksi. Temukan grand total.'),
    category: z.string().describe(`Kategori transaksi. Pilih dari daftar berikut: ${allCategories.join(', ')}`),
    date: z.string().describe('Tanggal transaksi dalam format YYYY-MM-DD. Jika tidak ditemukan, gunakan hari ini.'),
    description: z.string().describe('Deskripsi singkat transaksi, biasanya nama toko atau merchant.'),
    type: z.enum(['income', 'expense']).describe('Jenis transaksi. Sebagian besar struk adalah pengeluaran.'),
});
export type ExtractTransactionFromReceiptOutput = z.infer<typeof ExtractTransactionFromReceiptOutputSchema>;

export async function extractTransactionFromReceipt(input: ExtractTransactionFromReceiptInput): Promise<ExtractTransactionFromReceiptOutput> {
    return extractTransactionFromReceiptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractTransactionFromReceiptPrompt',
    input: { schema: ExtractTransactionFromReceiptInputSchema },
    output: { schema: ExtractTransactionFromReceiptOutputSchema },
    prompt: `Anda adalah pemindai struk ahli. Analisis gambar struk yang diberikan dan ekstrak detail transaksinya.

- Identifikasi nama merchant dan gunakan sebagai deskripsi.
- Temukan jumlah total akhir dari transaksi.
- Tentukan tanggal transaksi.
- Kategorikan transaksi berdasarkan item atau nama merchant. Transaksi kemungkinan besar adalah 'pengeluaran'.
- Berdasarkan konten, tentukan apakah ini transaksi 'pemasukan' atau 'pengeluaran'.
- verifikasi total nominal dalam Rupiah dan pastikan totalnya rasional terutama dalam pemisahan desimal 'titik' atau 'koma' karena terkadang ada yang menggunakan titik dan koma 

Kembalikan data dalam format JSON yang ditentukan.

Gambar Struk: {{media url=photoDataUri}}`,
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
