import { invokeLLM } from "./_core/llm";
import {
  contextExtractionPrompt,
  competitorDiscoveryPrompt,
  territoryAnalysisPrompt,
  strategicBriefPrompt,
} from "./ai-prompts";

// Helper to safely parse JSON from LLM response
function parseLLMJson(content: string): any {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : content.trim();
  return JSON.parse(raw);
}

export async function extractContext(url: string, companyName: string) {
  const prompt = contextExtractionPrompt(url, companyName);
  const result = await invokeLLM({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
  });
  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LLM response");
  return parseLLMJson(content);
}

export async function discoverCompetitors(
  companyName: string,
  industry: string,
  description: string,
  region: string
) {
  const prompt = competitorDiscoveryPrompt(companyName, industry, description, region);
  const result = await invokeLLM({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
  });
  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LLM response");
  const parsed = parseLLMJson(content);
  return parsed.competitors || parsed;
}

export async function analyzeTerritoriesAI(
  companyName: string,
  industry: string,
  competitorsData: string
) {
  const prompt = territoryAnalysisPrompt(companyName, industry, competitorsData);
  const result = await invokeLLM({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
  });
  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LLM response");
  const parsed = parseLLMJson(content);
  return parsed.territories || parsed;
}

export async function generateStrategicBrief(
  companyName: string,
  industry: string,
  competitorsData: string,
  territoriesData: string
) {
  const prompt = strategicBriefPrompt(companyName, industry, competitorsData, territoriesData);
  const result = await invokeLLM({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
  });
  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("Invalid LLM response");
  return parseLLMJson(content);
}
