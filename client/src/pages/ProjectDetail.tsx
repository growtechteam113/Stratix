import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { THREAT_LEVEL_CONFIG, TERRITORY_CONFIG } from "@shared/stratix-types";
import type { ThreatLevel, TerritoryType } from "@shared/stratix-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Target,
  Search,
  FileText,
  Shield,
  Compass,
  Swords,
  AlertTriangle,
  Loader2,
  Play,
  ExternalLink,
  Plus,
  Globe,
  Users,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
  Eye,
  Star,
  BarChart3,
  Layers,
  Navigation,
  Crosshair,
  Award,
  ArrowUpRight,
  Info,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation, useParams } from "wouter";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
  }),
};

/* ─── Threat Level Colors (THEO-inspired) ─── */
const THREAT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "CRITICAL" },
  high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", label: "HIGH" },
  moderate: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "MODERATE" },
  low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "LOW" },
};

const TERRITORY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  owned: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  unoccupied: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
  contested: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  indefensible: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

const TERRITORY_ICONS: Record<string, any> = {
  owned: Shield,
  unoccupied: Compass,
  contested: Swords,
  indefensible: AlertTriangle,
};

/* ─── Section Header Component ─── */
function SectionHeader({ number, title, subtitle, icon: Icon, children }: {
  number: string;
  title: string;
  subtitle?: string;
  icon: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs font-medium text-muted-foreground/60 tracking-wider">{number}</span>
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Score Bar Component ─── */
function ScoreBar({ value, max = 20, color = "bg-primary", height = "h-1.5" }: {
  value: number;
  max?: number;
  color?: string;
  height?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`w-full ${height} bg-muted/60 rounded-full overflow-hidden`}>
      <motion.div
        className={`${height} ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
}

/* ─── Competitor Score Card (THEO-inspired) ─── */
function CompetitorCard({ comp, onRemove }: { comp: any; onRemove?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const threat = THREAT_COLORS[comp.threatLevel as string] || THREAT_COLORS.moderate;
  const score = comp.threatScore || 0;

  return (
    <motion.div
      layout
      className={`bg-white border ${threat.border} rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "var(--font-display)" }}>
              {comp.name}
            </h3>
            {comp.isManual && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">Manual</span>
            )}
          </div>
          {comp.url && (
            <a
              href={comp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary/70 hover:text-primary hover:underline flex items-center gap-1 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => { try { return new URL(comp.url).hostname; } catch { return comp.url; } })()}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold leading-none" style={{ fontFamily: "var(--font-display)" }}>
            {score}<span className="text-xs font-normal text-muted-foreground">/20</span>
          </div>
          <div className={`text-[10px] font-bold tracking-wider uppercase mt-1 ${threat.text}`}>
            {threat.label}
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <ScoreBar
        value={score}
        max={20}
        color={score >= 17 ? "bg-red-500" : score >= 13 ? "bg-orange-500" : score >= 8 ? "bg-amber-500" : "bg-emerald-500"}
      />

      {/* Description */}
      {comp.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3 line-clamp-2">{comp.description}</p>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {comp.headquarters && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <MapPin className="w-2.5 h-2.5" /> {comp.headquarters}
          </span>
        )}
        {comp.employees && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <Users className="w-2.5 h-2.5" /> {comp.employees}
          </span>
        )}
        {comp.funding && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <DollarSign className="w-2.5 h-2.5" /> {comp.funding}
          </span>
        )}
        {comp.founded && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            <Calendar className="w-2.5 h-2.5" /> {comp.founded}
          </span>
        )}
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              {/* Strengths */}
              {comp.strengths && (comp.strengths as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {(comp.strengths as string[]).map((s: string, i: number) => (
                      <span key={i} className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {comp.weaknesses && (comp.weaknesses as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Weaknesses</p>
                  <div className="flex flex-wrap gap-1">
                    {(comp.weaknesses as string[]).map((w: string, i: number) => (
                      <span key={i} className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Overlap Areas */}
              {comp.overlapAreas && (comp.overlapAreas as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Overlap Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {(comp.overlapAreas as string[]).map((o: string, i: number) => (
                      <span key={i} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{o}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Differentiators */}
              {comp.keyDifferentiators && (comp.keyDifferentiators as string[]).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Key Differentiators</p>
                  <div className="flex flex-wrap gap-1">
                    {(comp.keyDifferentiators as string[]).map((d: string, i: number) => (
                      <span key={i} className="text-[11px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full border border-violet-100">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Remove button */}
              {onRemove && (
                <button
                  className="text-[11px] text-red-500 hover:text-red-700 hover:underline mt-2"
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                >
                  Remove competitor
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand hint */}
      <div className="flex items-center justify-center mt-2">
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
        )}
      </div>
    </motion.div>
  );
}

/* ─── Territory Card ─── */
function TerritoryCard({ territory }: { territory: any }) {
  const [expanded, setExpanded] = useState(false);
  const colors = TERRITORY_COLORS[territory.type as string] || TERRITORY_COLORS.contested;

  return (
    <div
      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${colors.border}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {territory.title}
          </h4>
          {territory.description && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">{territory.description}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {territory.strength != null && (
            <div className="text-right">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">STR</span>
              <span className="text-sm font-bold ml-1">{territory.strength}</span>
            </div>
          )}
          {territory.opportunity != null && (
            <div className="text-right">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">OPP</span>
              <span className="text-sm font-bold ml-1">{territory.opportunity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {territory.strength != null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Strength</span>
              <span className="text-[10px] font-bold">{territory.strength}/10</span>
            </div>
            <ScoreBar value={territory.strength} max={10} color={colors.dot.replace("bg-", "bg-")} height="h-1" />
          </div>
        )}
        {territory.opportunity != null && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Opportunity</span>
              <span className="text-[10px] font-bold">{territory.opportunity}/10</span>
            </div>
            <ScoreBar value={territory.opportunity} max={10} color="bg-primary" height="h-1" />
          </div>
        )}
      </div>

      {/* Competitors in this territory */}
      {territory.competitors && (territory.competitors as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {(territory.competitors as string[]).map((c: string, i: number) => (
            <span key={i} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
      )}

      {/* Expanded evidence */}
      <AnimatePresence>
        {expanded && territory.evidence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Evidence</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{territory.evidence}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── North Star Card (THEO-inspired) ─── */
function NorthStarCard({ brief }: { brief: any }) {
  if (!brief?.marketPosition) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-white p-8 sm:p-12 text-center">
      {/* Top accent line */}
      <div className="absolute top-0 left-[20%] right-[20%] h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-b" />
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
          <Navigation className="w-3 h-3" />
          Positioning North Star
        </div>

        {/* Score */}
        <div className="mb-6">
          <div className="text-6xl sm:text-7xl font-bold stratix-glow" style={{ fontFamily: "var(--font-display)" }}>
            {brief.overallScore || 0}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Competitive Position Score — out of 20</div>
        </div>

        {/* Score Explanation */}
        {brief.scoreExplanation && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
            {brief.scoreExplanation}
          </p>
        )}

        {/* Score breakdown bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
          {[
            { label: "Market Presence", value: Math.min(Math.round((brief.overallScore || 0) / 4), 5) },
            { label: "Competitive Edge", value: Math.min(Math.round((brief.overallScore || 0) / 4) + 1, 5) },
            { label: "Growth Potential", value: Math.min(Math.round((brief.overallScore || 0) / 3.5), 5) },
            { label: "Defensibility", value: Math.min(Math.round((brief.overallScore || 0) / 5), 5) },
          ].map((dim) => (
            <div key={dim.label} className="text-center">
              <ScoreBar value={dim.value} max={5} color="bg-primary" height="h-1" />
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5">{dim.label}</div>
              <div className="text-xs font-bold mt-0.5">{dim.value}/5</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Priority Badge ─── */
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    critical: { bg: "bg-red-100", text: "text-red-700" },
    high: { bg: "bg-orange-100", text: "text-orange-700" },
    medium: { bg: "bg-amber-100", text: "text-amber-700" },
    low: { bg: "bg-emerald-100", text: "text-emerald-700" },
  };
  const c = config[priority] || config.medium;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {priority}
    </span>
  );
}

/* ─── Impact Badge ─── */
function ImpactBadge({ impact }: { impact: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    transformative: { bg: "bg-violet-100", text: "text-violet-700" },
    significant: { bg: "bg-blue-100", text: "text-blue-700" },
    moderate: { bg: "bg-cyan-100", text: "text-cyan-700" },
    incremental: { bg: "bg-slate-100", text: "text-slate-700" },
  };
  const c = config[impact] || config.moderate;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {impact}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newComp, setNewComp] = useState({ name: "", url: "", description: "" });
  const [activeTerritory, setActiveTerritory] = useState<TerritoryType>("owned");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  /* ─── Queries ─── */
  const projectQuery = trpc.projects.get.useQuery({ id: projectId }, { enabled: !!user && !!projectId });
  const competitorsQuery = trpc.competitors.list.useQuery({ projectId }, { enabled: !!user && !!projectId });
  const territoriesQuery = trpc.territories.list.useQuery({ projectId }, { enabled: !!user && !!projectId });
  const briefQuery = trpc.brief.get.useQuery({ projectId }, { enabled: !!user && !!projectId });
  const jobsQuery = trpc.analysis.jobs.useQuery({ projectId }, { enabled: !!user && !!projectId, refetchInterval: 5000 });

  /* ─── Mutations ─── */
  const discoverMutation = trpc.analysis.discoverCompetitors.useMutation({
    onSuccess: () => { jobsQuery.refetch(); competitorsQuery.refetch(); projectQuery.refetch(); },
  });
  const territoriesMutation = trpc.analysis.generateTerritories.useMutation({
    onSuccess: () => { jobsQuery.refetch(); territoriesQuery.refetch(); },
  });
  const briefMutation = trpc.analysis.generateBrief.useMutation({
    onSuccess: () => { jobsQuery.refetch(); briefQuery.refetch(); projectQuery.refetch(); },
  });
  const fullMutation = trpc.analysis.runFull.useMutation({
    onSuccess: () => { jobsQuery.refetch(); projectQuery.refetch(); competitorsQuery.refetch(); territoriesQuery.refetch(); briefQuery.refetch(); },
  });
  const addCompMutation = trpc.competitors.add.useMutation({
    onSuccess: () => { competitorsQuery.refetch(); setShowAddCompetitor(false); setNewComp({ name: "", url: "", description: "" }); },
  });
  const removeCompMutation = trpc.competitors.remove.useMutation({
    onSuccess: () => competitorsQuery.refetch(),
  });
  const togglePublicMutation = trpc.brief.togglePublic.useMutation({
    onSuccess: () => briefQuery.refetch(),
  });

  /* ─── Derived State ─── */
  const project = projectQuery.data;
  const competitors = competitorsQuery.data ?? [];
  const allTerritories = territoriesQuery.data ?? [];
  const brief = briefQuery.data;
  const jobs = jobsQuery.data ?? [];
  const latestJob = jobs[0];
  const isAnalyzing = latestJob?.status === "running" || latestJob?.status === "pending";

  /* Group competitors by threat level */
  const threatGroups = useMemo(() => {
    const groups: Record<string, any[]> = { critical: [], high: [], moderate: [], low: [] };
    competitors.forEach((c: any) => {
      const level = c.threatLevel || "moderate";
      if (groups[level]) groups[level].push(c);
      else groups.moderate.push(c);
    });
    // Sort each group by score descending
    Object.values(groups).forEach((g) => g.sort((a: any, b: any) => (b.threatScore || 0) - (a.threatScore || 0)));
    return groups;
  }, [competitors]);

  /* Group territories by type */
  const territoryGroups = useMemo(() => {
    const groups: Record<string, any[]> = { owned: [], unoccupied: [], contested: [], indefensible: [] };
    allTerritories.forEach((t: any) => {
      if (groups[t.type]) groups[t.type].push(t);
    });
    return groups;
  }, [allTerritories]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ─── Loading / Auth / Not Found ─── */
  if (authLoading || projectQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading intelligence report...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl(`/project/${projectId}`);
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">Project not found</p>
          <Button variant="outline" className="mt-4" onClick={() => setLocation("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const hasCompetitors = competitors.length > 0;
  const hasTerritories = allTerritories.length > 0;
  const hasBrief = !!brief;

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ TOP BAR (THEO-inspired) ═══ */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{project.name}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                · Competitive Positioning Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">{latestJob?.progressMessage || "Analyzing..."}</span>
              </Badge>
            )}
            {!isAnalyzing && !hasBrief && (
              <Button size="sm" onClick={() => fullMutation.mutate({ projectId })} disabled={fullMutation.isPending} className="gap-1.5">
                {fullMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Full Analysis
              </Button>
            )}
            {hasBrief && (
              <>
                <Button variant="outline" size="sm" onClick={() => togglePublicMutation.mutate({ projectId })} className="gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{brief?.isPublic ? "Make Private" : "Share"}</span>
                </Button>
                {brief?.isPublic && brief?.publicSlug && (
                  <Button variant="outline" size="sm" onClick={() => window.open(`/report/${brief.publicSlug}`, "_blank")} className="gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Public Report</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══ PROGRESS BAR ═══ */}
      {isAnalyzing && latestJob && (
        <div className="border-b border-primary/10 bg-primary/3">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{latestJob.progressMessage || "Processing..."}</span>
                  <span className="text-xs text-muted-foreground font-mono">{latestJob.progress || 0}%</span>
                </div>
                <Progress value={latestJob.progress || 0} className="h-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10">

        {/* ═══ HERO SECTION ═══ */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          {/* Hero pills */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs font-semibold text-primary">
              <Globe className="w-3 h-3" />
              {project.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {project.region || "Global"}
            </span>
            {project.industry && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">
                <Layers className="w-3 h-3" />
                {project.industry}
              </span>
            )}
            {hasCompetitors && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-white text-xs text-muted-foreground">
                <Target className="w-3 h-3" />
                {competitors.length} competitors analyzed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {project.industry ? `${project.industry} Positioning Landscape` : "Competitive Positioning Intelligence"}
            {project.region && project.region !== "Global" ? ` — ${project.region}` : ""}
          </h1>

          {/* Context summary */}
          {project.contextSummary && (
            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
              {project.contextSummary}
            </p>
          )}

          {/* Website link */}
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
          >
            {(() => { try { return new URL(project.url).hostname; } catch { return project.url; } })()}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* ═══ SECTION 01: COMPETITIVE THREAT MAP ═══ */}
        <motion.section custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
          <SectionHeader number="01" title="Competitive Threat Map" subtitle="Competitors ranked by threat level to your positioning" icon={Crosshair}>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddCompetitor(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
              {!hasCompetitors && !isAnalyzing && (
                <Button size="sm" onClick={() => discoverMutation.mutate({ projectId })} disabled={discoverMutation.isPending} className="gap-1.5">
                  {discoverMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Discover
                </Button>
              )}
            </div>
          </SectionHeader>

          {!hasCompetitors ? (
            <div className="border-2 border-dashed border-border/60 rounded-xl py-16 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No competitors discovered yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Run analysis to discover and score competitors.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(["critical", "high", "moderate", "low"] as const).map((level) => {
                const group = threatGroups[level];
                if (group.length === 0) return null;
                const colors = THREAT_COLORS[level];
                const isCollapsed = collapsedGroups[level];

                return (
                  <div key={level}>
                    {/* Threat Group Header */}
                    <div
                      className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-border/50 cursor-pointer select-none"
                      onClick={() => toggleGroup(level)}
                    >
                      <span className={`text-xs font-bold tracking-wider uppercase ${colors.text}`}>
                        {colors.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {level === "critical" ? "Highest threat to your positioning" :
                         level === "high" ? "Significant competitive pressure" :
                         level === "moderate" ? "Moderate overlap and competition" :
                         "Limited direct threat"}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground ml-auto">
                        {group.length} {group.length === 1 ? "competitor" : "competitors"}
                      </span>
                      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>

                    {/* Cards Grid */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {group.map((comp: any) => (
                              <CompetitorCard
                                key={comp.id}
                                comp={comp}
                                onRemove={() => removeCompMutation.mutate({ id: comp.id, projectId })}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ═══ SECTION 02: POSITIONING TERRITORIES ═══ */}
        <motion.section custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
          <SectionHeader number="02" title="Positioning Territories" subtitle="Strategic positions in the competitive landscape" icon={Shield}>
            {hasCompetitors && !hasTerritories && !isAnalyzing && (
              <Button size="sm" onClick={() => territoriesMutation.mutate({ projectId })} disabled={territoriesMutation.isPending} className="gap-1.5">
                {territoriesMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                Map Territories
              </Button>
            )}
          </SectionHeader>

          {!hasTerritories ? (
            <div className="border-2 border-dashed border-border/60 rounded-xl py-16 text-center">
              <Compass className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {!hasCompetitors ? "Discover competitors first to map territories." : "Generate territory analysis to see the positioning map."}
              </p>
            </div>
          ) : (
            <div>
              {/* Territory Tabs (THEO-inspired) */}
              <div className="flex border-b-2 border-border/30 mb-0">
                {(["owned", "unoccupied", "contested", "indefensible"] as const).map((type) => {
                  const config = TERRITORY_CONFIG[type];
                  const colors = TERRITORY_COLORS[type];
                  const count = territoryGroups[type]?.length || 0;
                  const isActive = activeTerritory === type;
                  const Icon = TERRITORY_ICONS[type];

                  return (
                    <button
                      key={type}
                      onClick={() => setActiveTerritory(type)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-[3px] -mb-[2px] ${
                        isActive
                          ? `${colors.text} border-current bg-muted/30`
                          : "text-muted-foreground/60 border-transparent hover:text-muted-foreground hover:bg-muted/20"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{config.label}</span>
                      <span className="font-mono text-[10px] ml-0.5">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Territory Panel */}
              <div className="bg-white border border-border/50 border-t-0 rounded-b-xl p-5">
                <p className="text-xs text-muted-foreground mb-4">{TERRITORY_CONFIG[activeTerritory].description}</p>
                {(territoryGroups[activeTerritory]?.length || 0) === 0 ? (
                  <p className="text-sm text-muted-foreground/60 py-8 text-center">
                    No {TERRITORY_CONFIG[activeTerritory].label.toLowerCase()} territories identified.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {territoryGroups[activeTerritory]?.map((territory: any) => (
                      <TerritoryCard key={territory.id} territory={territory} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.section>

        {/* ═══ SECTION 03: NORTH STAR — POSITIONING SCORE ═══ */}
        {hasBrief && brief && (
          <motion.section custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="03" title="Positioning North Star" subtitle="Your competitive position score and strategic direction" icon={Navigation} />
            <NorthStarCard brief={brief} />
          </motion.section>
        )}

        {/* ═══ SECTION 04: EXECUTIVE SUMMARY ═══ */}
        {hasBrief && brief?.executiveSummary && (
          <motion.section custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="04" title="Executive Summary" subtitle="High-level strategic overview of your competitive position" icon={FileText} />
            <div className="bg-white border border-border/50 rounded-xl p-6">
              <p className="text-sm text-foreground/80 leading-[1.8]">{brief.executiveSummary}</p>
              {brief.marketPosition && (
                <div className="mt-5 pt-5 border-t border-border/30">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Market Position</p>
                  <p className="text-sm text-foreground/70 leading-[1.8]">{brief.marketPosition}</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ═══ SECTION 05: COMPETITIVE ADVANTAGES ═══ */}
        {hasBrief && brief?.competitiveAdvantages && (brief.competitiveAdvantages as string[]).length > 0 && (
          <motion.section custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="05" title="Competitive Advantages" subtitle="Your strongest positioning assets" icon={Award} />
            <div className="grid sm:grid-cols-2 gap-3">
              {(brief.competitiveAdvantages as string[]).map((adv: string, i: number) => (
                <div key={i} className="bg-white border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{adv}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══ SECTION 06: STRATEGIC RECOMMENDATIONS ═══ */}
        {hasBrief && brief?.strategicRecommendations && (brief.strategicRecommendations as any[]).length > 0 && (
          <motion.section custom={6} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="06" title="Strategic Recommendations" subtitle="Priority actions to strengthen your competitive position" icon={Zap} />
            <div className="space-y-3">
              {(brief.strategicRecommendations as any[]).map((rec: any, i: number) => (
                <div key={i} className="bg-white border border-border/50 rounded-xl p-5 flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <PriorityBadge priority={rec.priority || "medium"} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{rec.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══ SECTION 07: RISK FACTORS ═══ */}
        {hasBrief && brief?.riskFactors && (brief.riskFactors as any[]).length > 0 && (
          <motion.section custom={7} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="07" title="Risk Factors" subtitle="Threats and vulnerabilities to monitor" icon={AlertTriangle} />
            <div className="space-y-3">
              {(brief.riskFactors as any[]).map((risk: any, i: number) => (
                <div key={i} className="bg-white border border-red-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className={`w-4 h-4 ${
                      risk.severity === "critical" ? "text-red-600" :
                      risk.severity === "high" ? "text-orange-600" :
                      "text-amber-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{risk.title}</h4>
                      <PriorityBadge priority={risk.severity || "medium"} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══ SECTION 08: OPPORTUNITIES ═══ */}
        {hasBrief && brief?.opportunities && (brief.opportunities as any[]).length > 0 && (
          <motion.section custom={8} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <SectionHeader number="08" title="Opportunities" subtitle="White space and growth opportunities in the market" icon={TrendingUp} />
            <div className="grid sm:grid-cols-2 gap-3">
              {(brief.opportunities as any[]).map((opp: any, i: number) => (
                <div key={i} className="bg-white border border-blue-100 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{opp.title}</h4>
                    {opp.impact && <ImpactBadge impact={opp.impact} />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opp.description}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══ GENERATE BRIEF CTA ═══ */}
        {!hasBrief && hasTerritories && !isAnalyzing && (
          <motion.section custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mb-14">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/5 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  Ready to Generate Your Strategic Brief
                </h3>
                <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
                  Synthesize all competitive intelligence into actionable positioning recommendations, risk analysis, and growth opportunities.
                </p>
                <Button
                  size="lg"
                  onClick={() => briefMutation.mutate({ projectId })}
                  disabled={briefMutation.isPending}
                  className="gap-2 bg-white text-slate-900 hover:bg-white/90"
                >
                  {briefMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Generate Strategic Brief
                </Button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ FOOTER ═══ */}
        <motion.div custom={9} initial="hidden" animate="visible" variants={fadeUp} className="pt-8 pb-4 text-center border-t border-border/30">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <Sparkles className="w-3.5 h-3.5 text-primary/40" />
            Generated by STRATIX AI — Competitive Positioning Intelligence
          </div>
        </motion.div>
      </main>

      {/* ═══ ADD COMPETITOR DIALOG ═══ */}
      <Dialog open={showAddCompetitor} onOpenChange={setShowAddCompetitor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>Add Competitor</DialogTitle>
            <DialogDescription>Manually add a competitor to your analysis.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newComp.name) return;
              addCompMutation.mutate({
                projectId,
                name: newComp.name,
                url: newComp.url || undefined,
                description: newComp.description || undefined,
              });
            }}
            className="space-y-4 mt-2"
          >
            <div className="space-y-2">
              <Label>Competitor Name</Label>
              <Input placeholder="e.g., Competitor Inc" value={newComp.name} onChange={(e) => setNewComp((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Website (optional)</Label>
              <Input type="url" placeholder="https://competitor.com" value={newComp.url} onChange={(e) => setNewComp((p) => ({ ...p, url: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input placeholder="What do they do?" value={newComp.description} onChange={(e) => setNewComp((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddCompetitor(false)}>Cancel</Button>
              <Button type="submit" disabled={addCompMutation.isPending || !newComp.name}>
                {addCompMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Competitor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
