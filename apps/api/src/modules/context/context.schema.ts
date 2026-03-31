import { z } from 'zod';

export const ContextSchema = z.object({
  company_overview: z.string().describe('General description of the company'),
  product_summary: z.string().describe('Summary of main products/services'),
  ideal_customer_profile: z.string().describe('Description of target audience (ICP)'),
  pain_points: z.array(z.string()).describe('Key problems the product solves'),
  jobs_to_be_done: z.array(z.string()).describe('Core jobs customers hire the product for'),
  value_propositions: z.array(z.string()).describe('Primary value propositions'),
  messaging_pillars: z.array(z.string()).describe('Key themes in messaging'),
  tone_of_voice: z.string().describe('Brand voice description'),
  features: z.array(z.string()).describe('List of key features'),
  use_cases: z.array(z.string()).describe('Common use cases'),
  proof_points: z.array(z.string()).describe('Case studies, metrics, or social proof'),
  market_category: z.string().describe('Category they operate in'),
  competitors: z.array(z.string()).describe('Known competitors'),
  positioning_signals: z.array(z.string()).describe('How they position themselves in the market'),
  confidence_notes: z.string().describe('AI confidence in extracted data and missing gaps'),
});

export type Context = z.infer<typeof ContextSchema>;

export function validateContext(data: unknown): { valid: boolean; data?: Context; error?: string } {
  try {
    const validated = ContextSchema.parse(data);
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
