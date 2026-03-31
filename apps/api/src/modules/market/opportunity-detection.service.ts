import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';

@Injectable()
export class OpportunityDetectionService {
  private readonly logger = new Logger(OpportunityDetectionService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly contextService: ContextService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async detectOpportunities(projectId: string): Promise<any> {
    // Fetch project context
    const context = await this.contextService.getLatestContext(projectId);
    if (!context) {
      throw new BadRequestException('Project context not found');
    }

    // Fetch all competitors and their insights
    const competitors = await this.prisma.competitor.findMany({
      where: { projectId },
      include: { insight: true },
    });

    if (competitors.length === 0) {
      throw new BadRequestException('No competitors found for analysis');
    }

    // Fetch category cluster if available
    const categoryCluster = await this.prisma.categoryCluster.findUnique({
      where: { projectId },
    });

    // Build competitor insight summary
    const competitorInsights = competitors
      .filter((c) => c.insight)
      .map((c) => ({
        name: c.name,
        positioning: (c.insight?.insightData as any)?.positioning,
        messaging: (c.insight?.insightData as any)?.messaging_style,
        keyMessages: (c.insight?.insightData as any)?.key_claims,
        strengths: (c.insight?.insightData as any)?.strengths,
        weaknesses: (c.insight?.insightData as any)?.weaknesses,
      }));

    const prompt = this.buildOpportunityPrompt(
      context.contextData as any,
      competitorInsights,
      categoryCluster?.clusterData as any,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a strategic analyst. Identify market opportunities, saturated areas, and whitespace based on the provided market data. Return a valid JSON object.',
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

      let opportunityData: any;
      try {
        opportunityData = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse opportunity response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Save or update the opportunity zone
      await this.prisma.opportunityZone.upsert({
        where: { projectId },
        update: {
          opportunityData,
          generatedAt: new Date(),
        },
        create: {
          projectId,
          opportunityData,
        },
      });

      this.logger.log(`Detected opportunities for project ${projectId}`);

      return opportunityData;
    } catch (error) {
      this.logger.error(`Opportunity detection failed: ${error}`);
      throw error;
    }
  }

  private buildOpportunityPrompt(
    contextData: any,
    competitors: any[],
    categoryCluster?: any,
  ): string {
    const competitorText = competitors
      .map(
        (c) =>
          `- ${c.name}: "${c.positioning}" | Messages: [${c.keyMessages?.join(', ')}]`,
      )
      .join('\n');

    let clusterInfo = '';
    if (categoryCluster?.segments) {
      clusterInfo = `\n\nMarket Segments:\n${categoryCluster.segments
        .map((s: any) => `- ${s.name}: ${s.description} (${s.competitors?.length || 0} players)`)
        .join('\n')}`;
    }

    return `
Analyze the following market data to identify opportunities and threats.

Our Product:
- Summary: ${contextData.product_summary}
- Category: ${contextData.market_category}
- ICP: ${contextData.ideal_customer_profile}
- Value Props: ${contextData.value_propositions?.join(', ')}

Competitors:
${competitorText}
${clusterInfo}

Identify and return a JSON object with:
{
  "saturatedAreas": [
    {
      "area": "Description of saturated area",
      "reason": "Why it's saturated",
      "competitorCount": number,
      "difficulty": "high|medium|low"
    }
  ],
  "whitespaceOpportunities": [
    {
      "opportunity": "Description of whitespace",
      "targetAudience": "Who would benefit",
      "estimatedDifficulty": "high|medium|low",
      "potentialValue": "high|medium|low"
    }
  ],
  "emergingTrends": [
    {
      "trend": "Description of trend",
      "adoptionLevel": "early|growing|mainstream",
      "competitorsAdopting": ["Company1", "Company2"]
    }
  ],
  "narrativeOverlap": [
    {
      "overlap": "Shared messaging",
      "companies": ["Company1", "Company2"],
      "differentiationOpportunity": "How to differentiate"
    }
  ]
}
    `;
  }
}
