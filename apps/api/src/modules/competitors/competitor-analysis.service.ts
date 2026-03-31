import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaClient, CompetitorStatus } from '@prisma/client';
import { CompetitorInsight, validateCompetitorInsight } from './competitor.schema';
import { ContextService } from '../context/context.service';

@Injectable()
export class CompetitorAnalysisService {
  private readonly logger = new Logger(CompetitorAnalysisService.name);
  private readonly openai: OpenAI;

  constructor(
    private readonly prisma: PrismaClient,
    private readonly contextService: ContextService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeCompetitor(competitorId: string): Promise<CompetitorInsight> {
    // Fetch competitor and sources
    const competitor = await this.prisma.competitor.findUnique({
      where: { id: competitorId },
      include: { sources: true, project: true },
    });

    if (!competitor) {
      throw new BadRequestException('Competitor not found');
    }

    // Aggregate extracted text from sources
    const sourceTexts = competitor.sources
      .filter((s) => s.extractedText)
      .map((s) => s.extractedText)
      .join('\n\n');

    if (!sourceTexts || sourceTexts.trim().length === 0) {
      throw new BadRequestException('No source text available for analysis');
    }

    // Fetch project context for comparison
    const context = await this.contextService.getLatestContext(competitor.projectId);
    const contextData = context?.contextData as any;

    const prompt = this.buildAnalysisPrompt(
      competitor.name,
      sourceTexts,
      contextData,
    );

    try {
      // Update status to ANALYZING
      await this.prisma.competitor.update({
        where: { id: competitorId },
        data: { status: CompetitorStatus.ANALYZING },
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a competitive intelligence analyst. Analyze the provided competitor information and return structured insights in JSON format.',
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

      let parsedInsight: unknown;
      try {
        parsedInsight = JSON.parse(content);
      } catch (error) {
        this.logger.error(`Failed to parse competitor analysis response: ${content}`);
        throw new BadRequestException('Invalid JSON response from OpenAI');
      }

      // Validate against schema
      const validation = validateCompetitorInsight(parsedInsight);
      if (!validation.valid) {
        this.logger.error(`Competitor insight validation failed: ${validation.error}`);
        throw new BadRequestException(
          `Competitor insight validation failed: ${validation.error}`,
        );
      }

      // Save insight to database
      await this.prisma.competitorInsight.upsert({
        where: { competitorId },
        update: {
          insightData: validation.data as any,
          generatedAt: new Date(),
        },
        create: {
          competitorId,
          insightData: validation.data as any,
        },
      });
      // Update status to ANALYZED
      await this.prisma.competitor.update({
        where: { id: competitorId },
        data: { status: CompetitorStatus.ANALYZED },
      });

      this.logger.log(`Competitor ${competitor.name} analyzed successfully`);

      return validation.data!;
    } catch (error) {
      // Update status to FAILED
      await this.prisma.competitor.update({
        where: { id: competitorId },
        data: { status: CompetitorStatus.FAILED },
      });

      this.logger.error(`Competitor analysis failed: ${error}`);
      throw error;
    }
  }

  private buildAnalysisPrompt(
    competitorName: string,
    sourceText: string,
    contextData?: any,
  ): string {
    const truncatedText = sourceText.substring(0, 6000);

    let prompt = `
Analyze the following information about the competitor "${competitorName}" and provide structured competitive intelligence.

Competitor Information:
${truncatedText}

Return a JSON object with these exact fields:
{
  "company": "string - Company name",
  "positioning": "string - How they position themselves",
  "value_propositions": ["string array - Their value propositions"],
  "target_audience": "string - Their target customer profile",
  "messaging_style": "string - Tone and style of messaging",
  "key_claims": ["string array - Key claims they make"],
  "strengths": ["string array - Identified strengths"],
  "weaknesses": ["string array - Identified weaknesses"],
  "differentiation_clues": ["string array - How they differentiate"],
  "threat_indicators": ["string array - Potential threats they pose"],
  "confidence_notes": "string - Confidence level in analysis"
}
    `;

    if (contextData) {
      prompt += `

For reference, here is the context of the company we're analyzing for:
- Our Product: ${contextData.product_summary}
- Our ICP: ${contextData.ideal_customer_profile}
- Our Value Props: ${contextData.value_propositions?.join(', ')}

Use this context to identify specific differentiation clues and threat indicators.
      `;
    }

    return prompt;
  }
}
