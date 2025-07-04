'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing user input to
 * determine the relevance of genre or other context clues for personalized
 * film suggestions.
 *
 * - analyzeUserInput - A function that handles the user input analysis process.
 * - AnalyzeUserInputInput - The input type for the analyzeUserInput function.
 * - AnalyzeUserInputOutput - The return type for the analyzeUserInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeUserInputInputSchema = z.object({
  userInput: z
    .string()
    .describe('The user input to analyze for movie recommendations.'),
});
export type AnalyzeUserInputInput = z.infer<typeof AnalyzeUserInputInputSchema>;

const AnalyzeUserInputOutputSchema = z.object({
  relevantGenres: z
    .array(z.string())
    .describe('An array of relevant movie genres based on the user input.'),
  otherContextClues: z
    .string()
    .describe(
      'Any other relevant context clues derived from the user input that are not genres.'
    ),
});
export type AnalyzeUserInputOutput = z.infer<typeof AnalyzeUserInputOutputSchema>;

export async function analyzeUserInput(input: AnalyzeUserInputInput): Promise<AnalyzeUserInputOutput> {
  return analyzeUserInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserInputPrompt',
  input: {schema: AnalyzeUserInputInputSchema},
  output: {schema: AnalyzeUserInputOutputSchema},
  prompt: `You are an AI assistant designed to analyze user input for movie recommendations.

  Your task is to identify relevant movie genres and other context clues from the user's input.

  Consider the following:
  - The user's input may explicitly mention genres (e.g., "I like action movies").
  - The user's input may contain implicit preferences (e.g., "I want something with a lot of suspense").
  - Extract as many genres as possible and put it into the relevantGenres field, which is a string array.
  - Extract any other context clues and put it in otherContextClues, which is a string.

  User Input: {{{userInput}}}`,
});

const analyzeUserInputFlow = ai.defineFlow(
  {
    name: 'analyzeUserInputFlow',
    inputSchema: AnalyzeUserInputInputSchema,
    outputSchema: AnalyzeUserInputOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
