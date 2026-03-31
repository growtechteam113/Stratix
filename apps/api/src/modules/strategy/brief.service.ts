import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';
import { MarketService } from '../market/market.service';

@Injectable()
export class BriefService {
  private readonly logger = new Logger(BriefService.name);
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

  async generateStrategicBrief(projectId: string): Promise<any> {
    // Fetch all required data
    const context = await this.contextService.getLatestContext(projectId);
    if (!context) {
      throw new BadRequestException('Project context not found');
    }

    const competitors = await this.prisma.competitor.findMany({
      where: { projectId },
      include: { insight: true },
    });

    const market = await this.marketService.getMarketAnalysis(projectId);
    const positioning = await this.prisma.positioningStatement.findUnique({
      where: { projectId },
    });
    const scoreCard = await this.prisma.scoreCard.findUnique({
      where: { projectId },
    });

    const prompt = this.buildBriefPrompt(
      context.contextData as any,
      competitors,
      market,
      positioning?.statementData as any,
      scoreCard?.scoreData as any,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a world-class strategic consultant writing a comprehensive strategic brief. Write in premium, consultant-grade tone. Return a valid JSON object with well-structured sections.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from OpenAI');
      }

      let briefData: any;
      try {
        briefData = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse brief response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Save or update the strategic brief
      await this.prisma.strategicBrief.upsert({
        where: { projectId },
        update: {
          briefData,
          generatedAt: new Date(),
        },
        create: {
          projectId,
          briefData,
        },
      });

      this.logger.log(`Generated strategic brief for project ${projectId}`);

      return briefData;
    } catch (error) {
      this.logger.error(`Brief generation failed: ${error}`);
      throw error;
    }
  }

  private buildBriefPrompt(
    contextData: any,
    competitors: any[],
    market: any,
    positioning?: any,
    scoreCard?: any,
  ): string {
    const competitorSummary = competitors
      .slice(0, 5)
      .map((c) => `${c.name}`)
      .join(', ');

    return `
Generate a comprehensive strategic brief for this company. Write in premium, consultant-grade tone suitable for executive leadership.

Company Context:
- Product: ${contextData.product_summary}
- Category: ${contextData.market_category}
- ICP: ${contextData.ideal_customer_profile}
- Value Props: ${contextData.value_propositions?.join(', ')}

Market & Competitors:
- Key Competitors: ${competitorSummary}
- Market Segments: ${(market.categoryCluster?.segments as any)?.segments?.map((s: any) => s.name).join(', ') || 'N/A'}

Strategic Position:
${positioning ? `- Positioning: ${positioning.positioning_statement}` : ''}
${scoreCard ? `- Score: ${scoreCard.score}/20` : ''}

Generate and return a JSON object with these sections (each 2-3 paragraphs, premium tone):
{
  "executive_summary": "High-level overview of the strategic situation and recommendations",
  "market_landscape": "Analysis of the market, trends, and dynamics",
  "competitor_analysis": "Summary of competitive positioning and threats",
  "opportunity_mapping": "Key opportunities and whitespace areas",
  "positioning_strategy": "Our recommended positioning and differentiation approach",
  "strategic_recommendations": "Specific, actionable recommendations for the next 12 months"
}

Each section should be 2-3 paragraphs of premium, consultant-grade prose.
    `;
  }
}
