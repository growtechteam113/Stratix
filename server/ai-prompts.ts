// AI Prompt System for STRATIX AI
// Each function returns structured prompts for the LLM

export function contextExtractionPrompt(
  url: string,
  companyName: string,
  websiteContent: string,
  source: "website" | "search" | "none" = "none"
) {
  const domain = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").trim();
  const hasContent = websiteContent && websiteContent.length > 50;

  let contextBlock: string;
  if (source === "website" && hasContent) {
    contextBlock = `LIVE WEBSITE CONTENT (scraped directly from ${url}):
---
${websiteContent}
---

CRITICAL RULES:
1. Base your ENTIRE analysis on the scraped content above — nothing else.
2. The domain is "${domain}" — do NOT confuse this with any other company that has a similar name or a different TLD (e.g. .com vs .co vs .io). These are different companies.
3. Industry, description, competitors, and all fields must match what the website actually says.
4. Do NOT override the scraped content with your training knowledge about similarly named companies.`;
  } else if (source === "search" && hasContent) {
    contextBlock = `WEB SEARCH DATA (retrieved from search engine results for ${domain}):
---
${websiteContent}
---

CRITICAL RULES:
1. Base your ENTIRE analysis on the search data above — this is real, current information about ${domain}.
2. "${domain}" is a SPECIFIC company — do NOT confuse it with any similarly named domain (e.g. if the domain is .co, do NOT use data from a .com with the same name). These are ENTIRELY DIFFERENT companies.
3. Use the search snippets to determine the actual industry, description, and target market.
4. Do NOT mix in your training knowledge about other companies with similar names.
5. If the search data mentions a specific industry or location, use that exactly.`;
  } else {
    contextBlock = `WARNING: The website at ${url} could not be accessed and no web search data was found.

ABSOLUTE RULES — VIOLATIONS WILL PRODUCE WRONG RESULTS:
1. You MUST NOT use your training data to fill in details about this company.
2. "${domain}" is a SPECIFIC company. If the TLD is .co, it is NOT the same as a .com with the same root name — they are completely different companies operating in different industries.
3. Example: "owlytics.co" ≠ "owlytics.com". Do NOT use what you know about owlytics.com to answer about owlytics.co.
4. Your ONLY allowed inference: look at the words in the domain name "${domain}" itself. What industry might those root words suggest?
5. Set description to: "Website could not be accessed. Domain name suggests [inference from domain words only]."
6. Set industry to whatever the domain words imply — nothing more.
7. Do NOT name specific competitors. Use generic category placeholders only.`;
  }

  return {
    system: `You are STRATIX AI, a premium competitive intelligence engine. Your job is to extract business context STRICTLY from the data provided — either live website content or web search results. You MUST NOT use your training knowledge about any company. Different TLDs (.co vs .com vs .io vs .in) are ENTIRELY DIFFERENT companies even if the domain name looks similar — they can be in completely different industries. When you see a domain like "owlytics.co" you must ONLY look at the provided content, NEVER at what you know about "owlytics.com". Violating this rule produces completely wrong competitive analysis.`,
    user: `Extract business context for this company:

Company Name: ${companyName}
Website URL: ${url}
Domain: ${domain}

${contextBlock}

Return a JSON object with:
{
  "companyName": "string - exact company name as shown on their website or search results",
  "industry": "string - specific industry/sector based on the provided data",
  "description": "string - 2-3 sentence description based strictly on provided data",
  "targetMarket": "string - who they serve, based on provided data",
  "valueProposition": "string - core value proposition from provided data",
  "keyProducts": ["string array of main products/services from provided data"],
  "businessModel": "string - how they make money based on provided data",
  "estimatedSize": "string - startup/scaleup/enterprise",
  "keyTerms": ["string array of industry-specific terms from provided data"]
}`
  };
}

export function competitorDiscoveryPrompt(companyName: string, industry: string, description: string, region: string, url: string = "") {
  const domain = url ? url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").trim() : "";
  return {
    system: `You are STRATIX AI, a premium competitive intelligence engine. Discover the most relevant competitors for the given company. Focus on direct competitors, emerging threats, and adjacent players. Be specific and strategic. CRITICAL: Only suggest competitors that are genuinely in the same industry as the description states. Do NOT confuse companies with similar names in different sectors — different TLDs (e.g. .co vs .com) are entirely different companies.`,
    user: `Discover competitors for this company:
Company: ${companyName}${domain ? `\nDomain: ${domain}` : ""}
Industry: ${industry}
Description: ${description}
Region: ${region}

CRITICAL RULES:
1. The description above is the GROUND TRUTH about what this company does. Use it to anchor all competitor selection.
2. Only suggest competitors operating in the "${industry}" space as described above.
3. Do NOT use your training data about companies with similar names — focus only on the industry and description provided.${domain ? `\n4. "${domain}" is a SPECIFIC domain — if it ends in .co, do NOT confuse it with a .com company of the same name.` : ""}

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

export function territoryAnalysisPrompt(companyName: string, industry: string, competitorsData: string, description: string = "") {
  return {
    system: `You are STRATIX AI. Analyze the competitive landscape and map positioning territories. Each territory represents a strategic position in the market. Be specific about which positions are owned, unoccupied, contested, or indefensible. CRITICAL: Base your analysis ONLY on the company description and industry provided — do NOT layer in knowledge about similarly named companies from your training data.`,
    user: `Map positioning territories for:
Company: ${companyName}
Industry: ${industry}${description ? `\nDescription: ${description}` : ""}
Competitors: ${competitorsData}

CRITICAL: The industry and description above define what this company ACTUALLY does. All territories must be grounded in the "${industry}" space described above. Do NOT drift into unrelated industries.

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

export function strategicBriefPrompt(companyName: string, industry: string, competitorsData: string, territoriesData: string, description: string = "") {
  return {
    system: `You are STRATIX AI. Generate a premium strategic brief that synthesizes all competitive intelligence into actionable strategic recommendations. Write in a sharp, executive style. No fluff. CRITICAL: Base your brief STRICTLY on the company description and industry provided. Do NOT mix in knowledge about similarly named companies from your training data.`,
    user: `Generate a strategic brief for:
Company: ${companyName}
Industry: ${industry}${description ? `\nWhat this company does: ${description}` : ""}
Competitors: ${competitorsData}
Territories: ${territoriesData}

CRITICAL RULES:
1. The "What this company does" field above is the GROUND TRUTH. Every sentence of your brief must be consistent with it.
2. Do NOT introduce industries, products, or markets that aren't mentioned in the description or competitor data.
3. If "What this company does" says market research / competitive intelligence, every recommendation, risk, and opportunity must relate to that — not to healthcare, not to unrelated analytics.

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
