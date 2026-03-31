import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import { ContextService } from '../context/context.service';

@Injectable()
export class CategoryClusteringService {
  private readonly logger = new Logger(CategoryClusteringService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly contextService: ContextService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCategoryMap(projectId: string): Promise<any> {
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

    // Build competitor summary for clustering
    const competitorSummaries = competitors
      .filter((c) => c.insight)
      .map((c) => ({
        name: c.name,
        positioning: (c.insight?.insightData as any)?.positioning,
        targetAudience: (c.insight?.insightData as any)?.target_audience,
        valueProps: (c.insight?.insightData as any)?.value_propositions,
      }));

    const prompt = this.buildClusteringPrompt(
      context.contextData as any,
      competitorSummaries,
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a market analyst. Analyze the provided competitors and market context to identify distinct market segments and cluster competitors accordingly. Return a valid JSON object.',
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

      let clusterData: any;
      try {
        clusterData = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse clustering response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Save or update the category cluster
      await this.prisma.categoryCluster.upsert({
        where: { projectId },
        update: {
          clusterData,
          generatedAt: new Date(),
        },
        create: {
          projectId,
          clusterData,
        },
      });

      this.logger.log(`Generated category map for project ${projectId}`);

      return clusterData;
    } catch (error) {
      this.logger.error(`Category clustering failed: ${error}`);
      throw error;
    }
  }

  private buildClusteringPrompt(contextData: any, competitors: any[]): string {
    const competitorText = competitors
      .map(
        (c) =>
          `- ${c.name}: Positioning="${c.positioning}", Target="${c.targetAudience}", ValueProps=[${c.valueProps?.join(', ')}]`,
      )
      .join('\n');

    return `
Analyze the following market context and competitors to identify distinct market segments.

Our Market Context:
- Product: ${contextData.product_summary}
- Category: ${contextData.market_category}
- ICP: ${contextData.ideal_customer_profile}
- Value Props: ${contextData.value_propositions?.join(', ')}

Competitors:
${competitorText}

Identify 3-5 distinct market segments based on positioning, target audience, and value propositions.
Return a JSON object with this structure:
{
  "segments": [
    {
      "name": "Segment Name",
      "description": "Description of this segment",
      "characteristics": ["trait1", "trait2"],
      "competitors": ["CompetitorName1", "CompetitorName2"],
      "saturationLevel": "high|medium|low"
    }
  ],
  "ourProjectPosition": {
    "segment": "Segment Name",
    "rationale": "Why we fit here"
  }
}
    `;
  }
}
