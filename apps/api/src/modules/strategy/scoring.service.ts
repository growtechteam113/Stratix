import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly contextService: ContextService,
    private readonly marketService: MarketService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateScore(projectId: string): Promise<any> {
    // Fetch context, competitors, and market analysis
    const context = await this.contextService.getLatestContext(projectId);
    if (!context) {
      throw new BadRequestException('Project context not found');
    }

    const competitors = await this.prisma.competitor.findMany({
      where: { projectId },
      include: { insight: true },
    });

    const market = await this.marketService.getMarketAnalysis(projectId);

    const prompt = this.buildScoringPrompt(
      context.contextData as any,
      competitors,
      market,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a strategic advisor evaluating a company\'s market position and strategy. Score from 0-20 with detailed breakdown. Return a valid JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from OpenAI');
      }

      let scoreData: any;
      try {
        scoreData = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse score response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Ensure score is between 0-20
      if (scoreData.score < 0 || scoreData.score > 20) {
        scoreData.score = Math.max(0, Math.min(20, scoreData.score));
      }

      // Save or update the score card
      await this.prisma.scoreCard.upsert({
        where: { projectId },
        update: {
          scoreData,
          generatedAt: new Date(),
        },
        create: {
          projectId,
          scoreData,
        },
      });

      this.logger.log(`Generated score for project ${projectId}: ${scoreData.score}/20`);

      return scoreData;
    } catch (error) {
      this.logger.error(`Scoring failed: ${error}`);
      throw error;
    }
  }

  private buildScoringPrompt(
    contextData: any,
    competitors: any[],
    market: any,
  ): string {
    const competitorCount = competitors.length;
    const saturation = (market.opportunityZone?.opportunities as any)?.saturatedAreas?.length || 0;

    return `
Evaluate this company's market position and strategy on a scale of 0-20.

Company Profile:
- Product: ${contextData.product_summary}
- Category: ${contextData.market_category}
- ICP: ${contextData.ideal_customer_profile}
- Value Props: ${contextData.value_propositions?.join(', ')}

Market Context:
- Competitors Analyzed: ${competitorCount}
- Saturated Areas: ${saturation}
- Whitespace Opportunities: ${(market.opportunityZone?.opportunities as any)?.whitespaceOpportunities?.length || 0}

Score from 0-20 across these dimensions:
- Clarity (0-5): How clear is the positioning?
- Differentiation (0-5): How differentiated from competitors?
- Market Viability (0-5): How viable in the current market?
- Competitor Defense (0-5): How defensible against competitors?

Return a JSON object:
{
  "score": number (0-20),
  "dimension_breakdown": {
    "clarity": number,
    "differentiation": number,
    "market_viability": number,
    "competitor_defense": number
  },
  "overall_justification": "Why this score",
  "biggest_strengths": ["strength1", "strength2", "strength3"],
  "biggest_weaknesses": ["weakness1", "weakness2"],
  "priority_improvements": ["improvement1", "improvement2", "improvement3"]
}
    `;
  }
}
