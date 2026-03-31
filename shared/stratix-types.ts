// Shared types used by both client and server for STRATIX AI

export type ThreatLevel = "critical" | "high" | "moderate" | "low";
export type TerritoryType = "owned" | "unoccupied" | "contested" | "indefensible";
export type ProjectStatus = "draft" | "analyzing" | "ready" | "error";
export type ProjectStep = "define" | "discover" | "brief";
export type JobType = "context" | "competitors" | "territories" | "brief" | "full";
export type JobStatus = "pending" | "running" | "completed" | "failed";

export const THREAT_LEVEL_CONFIG = {
  critical: { label: "CRITICAL", color: "threat-critical", min: 17 },
  high: { label: "HIGH", color: "threat-high", min: 13 },
  moderate: { label: "MODERATE", color: "threat-moderate", min: 8 },
  low: { label: "LOW", color: "threat-low", min: 0 },
} as const;

export const TERRITORY_CONFIG = {
  owned: { label: "Owned", description: "Positions you clearly dominate", icon: "shield" },
  unoccupied: { label: "Unoccupied", description: "White space no one has claimed", icon: "compass" },
  contested: { label: "Contested", description: "Positions multiple players are fighting for", icon: "swords" },
  indefensible: { label: "Indefensible", description: "Positions too costly to defend", icon: "alert-triangle" },
} as const;

export const REGIONS = [
  "Global",
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa",
  "United States",
  "United Kingdom",
  "India",
  "Southeast Asia",
] as const;

export function getThreatLevel(score: number): ThreatLevel {
  if (score >= 17) return "critical";
  if (score >= 13) return "high";
  if (score >= 8) return "moderate";
  return "low";
}

export function getScoreColor(score: number): string {
  if (score >= 17) return "text-red-600";
  if (score >= 13) return "text-orange-500";
  if (score >= 8) return "text-yellow-600";
  return "text-green-600";
}
