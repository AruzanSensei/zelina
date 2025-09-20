// src/ai/flows/dairy-fact-generator.ts
'use server';

/**
 * @fileOverview Generates a random dairy-related fact.
 *
 * - generateDairyFact - A function that generates a dairy fact.
 * - DairyFactOutput - The return type for the generateDairyFact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DairyFactOutputSchema = z.object({
  fact: z.string().describe('A randomly generated fact about dairy.'),
});

export type DairyFactOutput = z.infer<typeof DairyFactOutputSchema>;

export async function generateDairyFact(): Promise<DairyFactOutput> {
  return generateDairyFactFlow();
}

const prompt = ai.definePrompt({
  name: 'dairyFactPrompt',
  prompt: 'Generate a random fact about dairy.',
  output: {schema: DairyFactOutputSchema},
});

const generateDairyFactFlow = ai.defineFlow(
  {
    name: 'generateDairyFactFlow',
    outputSchema: DairyFactOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
