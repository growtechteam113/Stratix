import { z } from 'zod';

export const CompetitorInsightSchema = z.object({
  company: z.string().describe('Competitor company name'),
  positioning: z.string().describe('How the competitor positions themselves'),
  value_propositions: z.array(z.string()).describe('Their stated value propositions'),
  target_audience: z.string().describe('Their target customer profile'),
  messaging_style: z.string().describe('Tone and style of their messaging'),
  key_claims: z.array(z.string()).describe('Key claims they make about their product'),
  strengths: z.array(z.string()).describe('Identified strengths'),
  weaknesses: z.array(z.string()).describe('Identified weaknesses or gaps'),
  differentiation_clues: z.array(z.string()).describe('How they differentiate from market'),
  threat_indicators: z.array(z.string()).describe('Potential threats they pose'),
  confidence_notes: z.string().describe('Confidence level in the analysis'),
});

export type CompetitorInsight = z.infer<typeof CompetitorInsightSchema>;

export function validateCompetitorInsight(
  data: unknown,
): { valid: boolean; data?: CompetitorInsight; error?: string } {
  try {
    const validated = CompetitorInsightSchema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join('; '),
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
}
