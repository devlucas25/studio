'use server';
/**
 * @fileOverview This file defines a Genkit flow that analyzes survey data and suggests improvements for future polling campaigns.
 *
 * @fileOverview This file defines a Genkit flow that analyzes survey data and suggests improvements for future polling campaigns.
 * - suggestImprovements - A function that takes survey data as input and returns suggestions for improvements.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The output type for the suggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  surveyData: z
    .string()
    .describe(
      'A string containing the collected survey data.  Include demographics, location data, responses to questions, and any other relevant information.'
    ),
  campaignGoals: z.string().describe('A description of the goals of the polling campaign.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestedImprovements: z
    .string()
    .describe(
      'A list of suggested improvements for future polling campaigns based on the analysis of the survey data.'
    ),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are an expert polling data analyst.

You will analyze the provided survey data and suggest improvements for future polling campaigns, such as identifying areas where additional data collection is needed, suggesting modifications to the survey questions, and advising on how to better achieve the stated campaign goals.

Survey Data: {{{surveyData}}}
Campaign Goals: {{{campaignGoals}}}

Suggested Improvements:`,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
