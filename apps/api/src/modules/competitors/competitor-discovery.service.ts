import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient, CompetitorStatus } from '@prisma/client';
import { ContextService } from '../context/context.service';

@Injectable()
export class CompetitorDiscoveryService {
  private readonly logger = new Logger(CompetitorDiscoveryService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly contextService: ContextService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async discoverCompetitors(projectId: string): Promise<string[]> {
    // Fetch the project's context to understand their market
    const context = await this.contextService.getLatestContext(projectId);

    if (!context) {
      throw new BadRequestException('Project context not found. Generate context first.');
    }

    const contextData = context.contextData as any;
    const prompt = this.buildDiscoveryPrompt(contextData);

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a market analyst. Based on the provided business context, suggest 5-10 likely competitors in their market. Return a JSON array of competitor names.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from OpenAI');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse competitor discovery response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      const competitors = parsed.competitors || [];
      return competitors;
    } catch (error) {
      this.logger.error(`Competitor discovery failed: ${error}`);
      throw error;
    }
  }

  async addCompetitor(
    projectId: string,
    name: string,
    website?: string,
  ): Promise<any> {
    // Check if competitor already exists
    const existing = await this.prisma.competitor.findUnique({
      where: {
        projectId_name: {
          projectId,
          name,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Competitor already exists');
    }

    // Create the competitor
    const competitor = await this.prisma.competitor.create({
      data: {
        projectId,
        name,
        website,
        status: CompetitorStatus.DISCOVERED,
      },
    });

    this.logger.log(`Added competitor ${name} to project ${projectId}`);

    return competitor;
  }

  async addDiscoveredCompetitors(
    projectId: string,
    competitorNames: string[],
  ): Promise<any[]> {
    const created: any[] = [];

    for (const name of competitorNames) {
      try {
        const competitor = await this.addCompetitor(projectId, name);
        created.push(competitor);
      } catch (error) {
        this.logger.warn(`Failed to add competitor ${name}: ${error}`);
      }
    }

    return created;
  }

  private buildDiscoveryPrompt(contextData: any): string {
    return `
Based on the following business context, suggest 5-10 likely competitors in their market:

Company Overview: ${contextData.company_overview}
Product Summary: ${contextData.product_summary}
Market Category: ${contextData.market_category}
Ideal Customer Profile: ${contextData.ideal_customer_profile}
Value Propositions: ${contextData.value_propositions?.join(', ')}

Return a JSON object with a "competitors" array containing competitor names:
{
  "competitors": ["Competitor 1", "Competitor 2", ...]
}
    `;
  }
}
