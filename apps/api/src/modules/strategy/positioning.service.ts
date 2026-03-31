import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class PositioningService {
  private readonly logger = new Logger(PositioningService.name);
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

  async generatePositioning(projectId: string): Promise<any> {
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

    const prompt = this.buildPositioningPrompt(
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
              'You are a world-class strategic positioning consultant. Generate a compelling, differentiated positioning statement based on the market context. Return a valid JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 2500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from OpenAI');
      }

      let statementData: any;
      try {
        statementData = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse positioning response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Save or update the positioning statement
      await this.prisma.positioningStatement.upsert({
        where: { projectId },
        update: {
          statementData,
          generatedAt: new Date(),
        },
        create: {
          projectId,
          statementData,
        },
      });

      this.logger.log(`Generated positioning for project ${projectId}`);

      return statementData;
    } catch (error) {
      this.logger.error(`Positioning generation failed: ${error}`);
      throw error;
    }
  }

  private buildPositioningPrompt(
    contextData: any,
    competitors: any[],
    market: any,
  ): string {
    const competitorNames = competitors.map((c) => c.name).join(', ');
    const segments = (market.categoryCluster?.segments as any)?.segments || [];
    const segmentNames = segments.map((s: any) => s.name).join(', ');

    return `
Generate a compelling positioning statement for this company/product based on the market context.

Our Business:
- Product: ${contextData.product_summary}
- ICP: ${contextData.ideal_customer_profile}
- Category: ${contextData.market_category}
- Value Props: ${contextData.value_propositions?.join(', ')}
- Pain Points Addressed: ${contextData.pain_points?.join(', ')}

Market Context:
- Competitors: ${competitorNames}
- Market Segments: ${segmentNames}
- Whitespace Opportunities: ${market.opportunityZone?.opportunities?.whitespaceOpportunities?.[0]?.opportunity || 'N/A'}

Generate and return a JSON object with these exact fields:
{
  "positioning_statement": "A 1-2 sentence elevator pitch that captures our unique position",
  "differentiation_strategy": "How we differentiate from competitors (2-3 sentences)",
  "messaging_framework": {
    "primary_message": "Our main message",
    "supporting_pillars": ["pillar1", "pillar2", "pillar3"]
  },
  "target_icp_alignment": "Why this positioning resonates with our ICP",
  "brand_narrative": "The broader brand story and values",
  "go_to_market_strategy": "High-level GTM approach",
  "positioning_rationale": "Why this positioning was chosen over alternatives"
}
    `;
  }
}
