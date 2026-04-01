import { invokeLLM } from "./_core/llm";
import {
  contextExtractionPrompt,
  competitorDiscoveryPrompt,
  territoryAnalysisPrompt,
  strategicBriefPrompt,
} from "./ai-prompts";

// Helper to safely parse JSON from LLM response
function parseLLMJson(content: string): any {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = jsonMatch ? jsonMatch[1].trim() : content.trim();
  return JSON.parse(raw);
}

// Extract readable text from raw HTML
function extractHtmlContent(html: string): string {
  const extract = (regex: RegExp) => {
    const m = html.match(regex);
    return m ? m[1].replace(/\s+/g, " ").trim() : "";
  };

  const title    = extract(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = extract(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,500})/i)
                || extract(/<meta[^>]+content=["']([^"']{0,500})["'][^>]+name=["']description["']/i);
  const ogTitle  = extract(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{0,200})/i);
  const ogDesc   = extract(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{0,500})/i);
  const twitterDesc = extract(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']{0,500})/i);

  const headingMatches = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi) || [];
  const headings = headingMatches
    .map(h => h.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
    .filter(h => h.length > 2 && h.length < 200)
    .slice(0, 14)
    .join(" | ");

  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);

  return [
    title    && `Page Title: ${title}`,
    ogTitle  && ogTitle !== title && `OG Title: ${ogTitle}`,
    metaDesc && `Meta Description: ${metaDesc}`,
    ogDesc   && ogDesc !== metaDesc && `OG Description: ${ogDesc}`,
    twitterDesc && twitterDesc !== metaDesc && `Twitter Description: ${twitterDesc}`,
    headings && `Page Headings: ${headings}`,
    bodyText && `Page Content Excerpt: ${bodyText}`,
  ].filter(Boolean).join("\n\n");
}

// Try fetching a single URL candidate
async function tryFetch(candidate: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    const res = await fetch(candidate, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) return "";
    const html = await res.text();
    if (html.length < 200) return "";
    return extractHtmlContent(html);
  } catch {
    clearTimeout(timer);
    return "";
  }
}

// Fetch and extract readable content from a website — tries multiple URL variants
async function fetchWebsiteContent(url: string): Promise<string> {
  // Build a list of URL variants to try
  let normalized = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  const withoutProtocol = normalized.replace(/^https?:\/\//i, "");
  const candidates: string[] = [];

  // Prefer the URL exactly as given
  candidates.push(normalized);
  // Try www. prefix if not already there
  if (!withoutProtocol.startsWith("www.")) candidates.push(`https://www.${withoutProtocol}`);
  // Try http if https fails
  candidates.push(`http://${withoutProtocol}`);
  if (!withoutProtocol.startsWith("www.")) candidates.push(`http://www.${withoutProtocol}`);

  for (const candidate of candidates) {
    console.log(`[fetchWebsiteContent] Trying: ${candidate}`);
    const content = await tryFetch(candidate);
    if (content && content.length > 100) {
      console.log(`[fetchWebsiteContent] Success: ${candidate} (${content.length} chars)`);
      return content;
    }
  }

  // Try common sub-pages that may work even when root is JS-rendered
  const subPages = ["/about", "/about-us", "/company", "/home", "/products", "/services", "/features"];
  const httpsBase = `https://${withoutProtocol}`;
  for (const path of subPages) {
    const candidate = `${httpsBase}${path}`;
    console.log(`[fetchWebsiteContent] Trying sub-page: ${candidate}`);
    const content = await tryFetch(candidate);
    if (content && content.length > 100) {
      console.log(`[fetchWebsiteContent] Sub-page success: ${candidate} (${content.length} chars)`);
      return content;
    }
  }

  console.warn(`[fetchWebsiteContent] All attempts failed for ${url}`);
  return "";
}

// DuckDuckGo Instant Answer API — free, no key required
async function ddgInstantAnswer(domain: string, companyName: string): Promise<string> {
  const query = `${companyName} ${domain}`;
  const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&t=stratix-ai`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Stratix-AI/1.0 (competitive intelligence research)" },
    });
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = await res.json() as any;
    const parts: string[] = [];
    if (data.Heading)       parts.push(`Company: ${data.Heading}`);
    if (data.AbstractText)  parts.push(`Description: ${data.AbstractText}`);
    if (data.AbstractSource) parts.push(`Source: ${data.AbstractSource}`);
    if (data.AbstractURL)   parts.push(`URL: ${data.AbstractURL}`);
    const topics = ((data.RelatedTopics as any[]) || [])
      .filter((t: any) => t.Text)
      .slice(0, 6)
      .map((t: any) => t.Text as string);
    if (topics.length) parts.push(`Related: ${topics.join(" | ")}`);
    const result = parts.join("\n").trim();
    if (result.length > 20) console.log(`[ddgInstantAnswer] Got ${result.length} chars for "${query}"`);
    return result;
  } catch {
    clearTimeout(timer);
    return "";
  }
}

// DuckDuckGo HTML search — scrapes result titles + snippets
async function ddgSearchSnippets(domain: string, companyName: string): Promise<string> {
  // Try multiple targeted queries — most specific first
  const queries = [
    `"${companyName}" "${domain}" company`,
    `"${companyName}" company industry services about`,
    `${domain} startup company what they do`,
  ];

  for (const query of queries) {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=us`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cookie": "p=-2",
        },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const html = await res.text();

      // Multiple selector patterns for robustness (DDG sometimes changes classes)
      const allText: string[] = [];

      // Pattern 1: result__snippet anchor
      const snippetRe1 = /<a[^>]+class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
      // Pattern 2: any span/div near result__body
      const snippetRe2 = /class="[^"]*result__body[^"]*"[^>]*>([\s\S]*?)<\/(?:div|li)>/gi;

      let m: RegExpExecArray | null;
      for (const re of [snippetRe1, snippetRe2]) {
        re.lastIndex = 0;
        while ((m = re.exec(html)) !== null) {
          const s = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          if (s.length > 20 && s.length < 600) allText.push(s);
          if (allText.length >= 8) break;
        }
        if (allText.length >= 3) break;
      }

      // Pattern 3: result__a titles
      const titles: string[] = [];
      const titleRe = /<a[^>]+class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
      while ((m = titleRe.exec(html)) !== null) {
        const t = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
        if (t.length > 5 && t.length < 200) titles.push(t);
        if (titles.length >= 5) break;
      }

      if (titles.length === 0 && allText.length === 0) continue;

      const combined = [
        titles.length ? `Search Result Titles:\n${titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}` : "",
        allText.length ? `Search Result Snippets:\n${allText.map((s, i) => `${i + 1}. ${s}`).join("\n")}` : "",
      ].filter(Boolean).join("\n\n");

      console.log(`[ddgSearchSnippets] Got ${titles.length} titles + ${allText.length} snippets for "${query}"`);
      return combined;
    } catch {
      clearTimeout(timer);
    }
  }
  return "";
}

// Extract content from React/Vite/CRA SPA by parsing the JS bundle directly
// Works even when Jina is rate-limited — no external service needed
async function extractFromSpaBundle(candidate: string): Promise<string> {
  // Step 1: Fetch the HTML shell to find the bundle <script src>
  const ctrlHtml = new AbortController();
  const timerHtml = setTimeout(() => ctrlHtml.abort(), 10000);
  let html = "";
  try {
    const r = await fetch(candidate, {
      signal: ctrlHtml.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });
    clearTimeout(timerHtml);
    if (!r.ok) return "";
    html = await r.text();
  } catch { clearTimeout(timerHtml); return ""; }

  // Only proceed if the body has no real content (it's a SPA shell)
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (bodyText.length > 300) return ""; // Has SSR content — skip bundle parsing

  // Step 2: Find the main bundle script URL (Vite or CRA patterns)
  const scriptMatch =
    html.match(/src="(\/assets\/index[^"]+\.js)"/i) ||
    html.match(/src="(\/static\/js\/main[^"]+\.js)"/i) ||
    html.match(/src="(\/assets\/[^"]+\.js)"/i);
  if (!scriptMatch) return "";

  const origin = candidate.match(/^(https?:\/\/[^/]+)/)?.[1] || "";
  if (!origin) return "";
  const bundleUrl = `${origin}${scriptMatch[1]}`;

  // Step 3: Fetch the JS bundle
  const ctrlJs = new AbortController();
  const timerJs = setTimeout(() => ctrlJs.abort(), 25000);
  let js = "";
  try {
    const r = await fetch(bundleUrl, {
      signal: ctrlJs.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": candidate,
      },
    });
    clearTimeout(timerJs);
    if (!r.ok) return "";
    js = await r.text();
  } catch { clearTimeout(timerJs); return ""; }

  // Step 4: Extract readable text strings from the minified bundle
  const extracted = new Set<string>();
  const re = /"([A-Za-z][^"\\]{20,400})"/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(js)) !== null) {
    const raw = m[1];
    const s = raw
      .replace(/\\n/g, " ").replace(/\\t/g, " ").replace(/\\r/g, "")
      .replace(/\s+/g, " ").trim();

    // Skip code, CSS, HTML attributes, hashes, URLs
    if (s.length < 20) continue;
    if (/[<>{}\[\]\\]/.test(s)) continue;
    if (/^https?:\/\//.test(s)) continue;
    if (/^[A-Z0-9_]{5,}$/.test(s)) continue;      // CONSTANTS
    if (/^[0-9a-f-]{8,}$/.test(s)) continue;       // hashes
    if (/rgba?\(|#[0-9a-f]{3,6}\b/i.test(s)) continue; // CSS
    if (/^data-|^aria-/.test(s)) continue;          // HTML attrs
    if (/[A-Z]{2}[a-z]/.test(s.slice(0, 8))) continue; // camelCase
    if (s.split(/\s+/).length < 3) continue;        // < 3 words
    const lowerRatio = (s.match(/[a-z]/g) || []).length / s.length;
    if (lowerRatio < 0.45) continue;                // not mostly lowercase

    extracted.add(s);
    if (extracted.size >= 60) break;
  }

  if (extracted.size < 5) return "";

  const extractedArr = Array.from(extracted);
  console.log(`[spaBundle] Extracted ${extractedArr.length} text strings from ${bundleUrl}`);
  return `[Content extracted from website JavaScript bundle for ${candidate}]\n\n${extractedArr.join("\n")}`;
}

// Jina AI Reader — renders JavaScript-heavy pages and returns clean text/markdown
// Free to use, no API key required for basic usage
async function fetchWithJinaReader(url: string): Promise<string> {
  let normalized = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

  const jinaUrl = `https://r.jina.ai/${normalized}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        "Accept": "text/plain",
        "X-Return-Format": "text",
        "X-Timeout": "25",
        "User-Agent": "Mozilla/5.0 (compatible; Stratix-AI/1.0)",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[jinaReader] HTTP ${res.status} for ${url}`);
      return "";
    }
    const text = await res.text();
    if (text.length < 200) return "";
    // Detect error responses
    const head = text.slice(0, 300).toLowerCase();
    if ((head.includes("error") || head.includes("blocked") || head.includes("not found")) && text.length < 800) return "";
    console.log(`[jinaReader] Success: ${url} (${text.length} chars)`);
    return text.slice(0, 7000);
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[jinaReader] Failed for ${url}:`, err);
    return "";
  }
}

// Gather all available company intelligence — website first, then search fallbacks
async function gatherCompanyIntelligence(
  url: string,
  companyName: string
): Promise<{ content: string; source: "website" | "search" | "none" }> {
  let normalized = url.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
  const domain = normalized.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").trim();

  // Run all three website fetch methods in parallel:
  // 1. Direct fetch — works for static/SSR pages
  // 2. SPA bundle extraction — works for React/Vite/CRA SPAs with no SSR (fetches & parses the JS bundle)
  // 3. Jina AI Reader — JS-rendering service (may be rate-limited on some IPs)
  console.log(`[gatherCompanyIntelligence] Starting for ${domain}`);
  const [directContent, spaContent, jinaContent] = await Promise.all([
    fetchWebsiteContent(normalized),
    extractFromSpaBundle(normalized),
    fetchWithJinaReader(normalized),
  ]);

  // Prefer direct scrape, then SPA bundle (both under our control), then Jina
  if (directContent && directContent.length > 100) {
    console.log(`[gatherCompanyIntelligence] Using direct scrape for ${domain}`);
    return { content: directContent, source: "website" };
  }
  if (spaContent && spaContent.length > 200) {
    console.log(`[gatherCompanyIntelligence] Using SPA bundle extraction for ${domain}`);
    return { content: spaContent, source: "website" };
  }
  if (jinaContent && jinaContent.length > 200) {
    console.log(`[gatherCompanyIntelligence] Using Jina AI Reader for ${domain}`);
    return { content: `[Website content rendered by Jina AI Reader for ${domain}]\n\n${jinaContent}`, source: "website" };
  }

  console.log(`[gatherCompanyIntelligence] Website not accessible, trying search for ${domain}`);

  // Run DDG instant answer and HTML search in parallel
  const [instantAnswer, searchSnippets] = await Promise.all([
    ddgInstantAnswer(domain, companyName),
    ddgSearchSnippets(domain, companyName),
  ]);

  // Combine all search data for maximum context
  const searchParts: string[] = [];
  if (instantAnswer && instantAnswer.length > 30) searchParts.push(`[DuckDuckGo Instant Answer]\n${instantAnswer}`);
  if (searchSnippets && searchSnippets.length > 30) searchParts.push(`[Web Search Results]\n${searchSnippets}`);

  if (searchParts.length > 0) {
    const combined = `[Web intelligence gathered for ${domain}]\n\n${searchParts.join("\n\n---\n\n")}`;
    console.log(`[gatherCompanyIntelligence] Using search data (${combined.length} chars) for ${domain}`);
    return { content: combined, source: "search" };
  }

  console.warn(`[gatherCompanyIntelligence] All sources failed for ${domain}`);
  return { content: "", source: "none" };
}

export async function extractContext(url: string, companyName: string) {
  const { content: websiteContent, source } = await gatherCompanyIntelligence(url, companyName);
  const prompt = contextExtractionPrompt(url, companyName, websiteContent, source);
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
  region: string,
  url: string = ""
) {
  const prompt = competitorDiscoveryPrompt(companyName, industry, description, region, url);
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
  competitorsData: string,
  description: string = ""
) {
  const prompt = territoryAnalysisPrompt(companyName, industry, competitorsData, description);
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
  territoriesData: string,
  description: string = ""
) {
  const prompt = strategicBriefPrompt(companyName, industry, competitorsData, territoriesData, description);
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
