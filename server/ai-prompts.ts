// AI Prompt System for STRATIX AI
// Each function returns structured prompts for the LLM

export function contextExtractionPrompt(url: string, companyName: string) {
  return {
    system: `You are STRATIX AI, a premium competitive intelligence engine. Extract and analyze the core business context from the given company information. Be precise, strategic, and evidence-based. Avoid generic statements.`,
    user: `Analyze this company and extract key business context:
Company: ${companyName}
URL: ${url}

Return a JSON object with:
{
  "companyName": "string",
  "industry": "string - specific industry/sector",
  "description": "string - 2-3 sentence business description",
  "targetMarket": "string - who they serve",
  "valueProposition": "string - core value proposition",
  "keyProducts": ["string array of main products/services"],
  "businessModel": "string - how they make money",
  "estimatedSize": "string - startup/scaleup/enterprise",
  "keyTerms": ["string array of industry-specific terms"]
}`
  };
}

export function competitorDiscoveryPrompt(companyName: string, industry: string, description: string, region: string) {
  return {
    system: `You are STRATIX AI, a premium competitive intelligence engine. Discover the most relevant competitors for the given company. Focus on direct competitors, emerging threats, and adjacent players. Be specific and strategic.`,
    user: `Discover competitors for this company:
Company: ${companyName}
Industry: ${industry}
Description: ${description}
Region: ${region}

Return a JSON array of 5-8 competitors, each with:
{
  "competitors": [
    {
      "name": "string",
      "url": "string - company website URL",
      "description": "string - 2-3 sentences about what they do",
      "threatScore": "number 1-20 - how much of a competitive threat they are",
      "funding": "string - e.g. 'Series B - $45M' or 'Bootstrapped' or 'Public'",
      "founded": "string - year",
      "employees": "string - range like '50-200'",
      "headquarters": "string - city, country",
      "strengths": ["string array - 3-4 key strengths"],
      "weaknesses": ["string array - 2-3 key weaknesses"],
      "keyDifferentiators": ["string array - what makes them unique"],
      "overlapAreas": ["string array - where they compete directly"]
    }
  ]
}

Score guide: 17-20 = CRITICAL threat, 13-16 = HIGH threat, 8-12 = MODERATE, 1-7 = LOW.
Be realistic with scores. Not every competitor is critical.`
  };
}

export function competitorIntelligencePrompt(companyName: string, competitorName: string, competitorUrl: string) {
  return {
    system: `You are STRATIX AI. Provide deep competitive intelligence analysis comparing a company against a specific competitor. Be precise and actionable.`,
    user: `Analyze the competitive relationship:
Your Company: ${companyName}
Competitor: ${competitorName} (${competitorUrl})

Return a JSON object with:
{
  "comparisonMatrix": {
    "features": ["feature1", "feature2", ...],
    "yourCompany": { "feature1": "strong/moderate/weak", ... },
    "competitor": { "feature1": "strong/moderate/weak", ... }
  },
  "threatAssessment": "string - detailed threat analysis",
  "competitiveGaps": ["string array - gaps you can exploit"],
  "defensiveActions": ["string array - actions to defend against this competitor"]
}`
  };
}

export function territoryAnalysisPrompt(companyName: string, industry: string, competitorsData: string) {
  return {
    system: `You are STRATIX AI. Analyze the competitive landscape and map positioning territories. Each territory represents a strategic position in the market. Be specific about which positions are owned, unoccupied, contested, or indefensible.`,
    user: `Map positioning territories for:
Company: ${companyName}
Industry: ${industry}
Competitors: ${competitorsData}

Return a JSON object with territories in 4 categories:
{
  "territories": [
    {
      "type": "owned | unoccupied | contested | indefensible",
      "title": "string - short territory name (e.g., 'Enterprise AI Analytics')",
      "description": "string - 2-3 sentences explaining this territory",
      "evidence": "string - why this classification",
      "competitors": ["string array - competitor names active here"],
      "strength": "number 1-10 - how strong the position is",
      "opportunity": "number 1-10 - opportunity level"
    }
  ]
}

Generate 3-5 territories per category (12-20 total). Be specific to the actual market, not generic.`
  };
}

export function strategicBriefPrompt(companyName: string, industry: string, competitorsData: string, territoriesData: string) {
  return {
    system: `You are STRATIX AI. Generate a premium strategic brief that synthesizes all competitive intelligence into actionable strategic recommendations. Write in a sharp, executive style. No fluff.`,
    user: `Generate a strategic brief for:
Company: ${companyName}
Industry: ${industry}
Competitors: ${competitorsData}
Territories: ${territoriesData}

Return a JSON object:
{
  "overallScore": "number 1-20 - overall competitive position score",
  "scoreExplanation": "string - 3-4 sentences explaining the score",
  "executiveSummary": "string - 4-5 sentence executive summary",
  "marketPosition": "string - 3-4 sentences on current market position",
  "competitiveAdvantages": ["string array - 4-6 key advantages"],
  "strategicRecommendations": [
    {
      "title": "string",
      "description": "string - 2-3 sentences",
      "priority": "critical | high | medium | low"
    }
  ],
  "riskFactors": [
    {
      "title": "string",
      "description": "string - 2-3 sentences",
      "severity": "critical | high | medium | low"
    }
  ],
  "opportunities": [
    {
      "title": "string",
      "description": "string - 2-3 sentences",
      "impact": "transformative | significant | moderate | incremental"
    }
  ]
}

Score guide: 17-20 = Dominant position, 13-16 = Strong position, 8-12 = Developing, 1-7 = Vulnerable.
Generate 4-6 recommendations, 3-5 risks, and 4-6 opportunities.`
  };
}

export function scoringPrompt(companyName: string, briefData: string) {
  return {
    system: `You are STRATIX AI. Provide a detailed scoring explanation for the company's competitive position. Be specific and evidence-based.`,
    user: `Score and explain the competitive position of ${companyName}:
Brief Data: ${briefData}

Return a JSON object:
{
  "score": "number 1-20",
  "breakdown": {
    "marketPresence": "number 1-5",
    "competitiveAdvantage": "number 1-5",
    "growthPotential": "number 1-5",
    "defensibility": "number 1-5"
  },
  "explanation": "string - 4-5 sentences explaining the overall score",
  "categoryExplanations": {
    "marketPresence": "string - 2 sentences",
    "competitiveAdvantage": "string - 2 sentences",
    "growthPotential": "string - 2 sentences",
    "defensibility": "string - 2 sentences"
  }
}`
  };
}
