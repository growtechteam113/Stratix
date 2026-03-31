import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Context, validateContext } from './context.schema';

@Injectable()
export class ContextGenerationService {
  private readonly logger = new Logger(ContextGenerationService.name);
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContext(sourceText: string): Promise<Context> {
    try {
      const prompt = this.buildPrompt(sourceText);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert business analyst. Extract and structure business context from the provided text. Return a valid JSON object matching the specified schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content =
        response.choices[0]?.message?.content ||
        '{}';

      let parsedContext: unknown;
      try {
        parsedContext = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse context response: ${content}`);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate against schema
      const validation = validateContext(parsedContext);
      if (!validation.valid) {
        this.logger.error(`Context validation failed: ${validation.error}`);
        throw new Error(`Context validation failed: ${validation.error}`);
      }

      return validation.data!;
    } catch (error) {
      this.logger.error(`Context generation failed: ${error}`);
      throw error;
    }
  }

  private buildPrompt(sourceText: string): string {
    return `
Extract and structure business context from the following text. Return a JSON object with these fields:
- company_overview: General description of the company
- product_summary: Summary of main products/services
- ideal_customer_profile: Description of target audience (ICP)
- pain_points: Key problems the product solves (array)
- jobs_to_be_done: Core jobs customers hire the product for (array)
- value_propositions: Primary value propositions (array)
- messaging_pillars: Key themes in messaging (array)
- tone_of_voice: Brand voice description
- features: List of key features (array)
- use_cases: Common use cases (array)
- proof_points: Case studies, metrics, or social proof (array)
- market_category: Category they operate in
- competitors: Known competitors (array)
- positioning_signals: How they position themselves in the market (array)
- confidence_notes: AI confidence in extracted data and missing gaps

Text to analyze:
${sourceText}
`;
  }
}
