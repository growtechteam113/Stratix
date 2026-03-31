import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Loader2,
  XCircle,
  Navigation,
  Award,
  Zap,
  Shield,
} from "lucide-react";
import { useParams } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.06 },
  }),
};

/* ─── Score Bar ─── */
function ScoreBar({ value, max = 5, height = "h-1" }: { value: number; max?: number; height?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`w-full ${height} bg-muted/60 rounded-full overflow-hidden`}>
      <motion.div
        className={`${height} bg-primary rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8 }}
      />
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

/* ─── Section Header ─── */
function SectionHeader({ number, title, icon: Icon }: { number: string; title: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-mono text-xs font-medium text-muted-foreground/60 tracking-wider">{number}</span>
      <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
    </div>
  );
}

export default function PublicReport() {
  const params = useParams<{ slug: string }>();
  const briefQuery = trpc.brief.getPublic.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  const brief = briefQuery.data;

  if (briefQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading intelligence report...</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium">Report not found</p>
          <p className="text-sm text-muted-foreground mt-1">This report may have been made private or deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ TOP BAR ═══ */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              STRATIX AI
            </span>
            <div className="w-px h-4 bg-border" />
            <span className="text-xs text-muted-foreground">Competitive Positioning Intelligence</span>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            <FileText className="w-3 h-3" />
            Strategic Brief
          </Badge>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 sm:px-10 py-10">

        {/* ═══ NORTH STAR — SCORE ═══ */}
        <motion.section custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-white p-8 sm:p-12 text-center">
            <div className="absolute top-0 left-[20%] right-[20%] h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent rounded-b" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Navigation className="w-3 h-3" />
                Positioning North Star
              </div>

              <div className="mb-6">
                <div className="text-6xl sm:text-7xl font-bold stratix-glow" style={{ fontFamily: "var(--font-display)" }}>
                  {brief.overallScore || 0}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Competitive Position Score — out of 20</div>
              </div>

              {brief.scoreExplanation && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                  {brief.scoreExplanation}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {[
                  { label: "Market Presence", value: Math.min(Math.round((brief.overallScore || 0) / 4), 5) },
                  { label: "Competitive Edge", value: Math.min(Math.round((brief.overallScore || 0) / 4) + 1, 5) },
                  { label: "Growth Potential", value: Math.min(Math.round((brief.overallScore || 0) / 3.5), 5) },
                  { label: "Defensibility", value: Math.min(Math.round((brief.overallScore || 0) / 5), 5) },
                ].map((dim) => (
                  <div key={dim.label} className="text-center">
                    <ScoreBar value={dim.value} max={5} />
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-1.5">{dim.label}</div>
                    <div className="text-xs font-bold mt-0.5">{dim.value}/5</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══ EXECUTIVE SUMMARY ═══ */}
        {brief.executiveSummary && (
          <motion.section custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <SectionHeader number="01" title="Executive Summary" icon={FileText} />
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

        {/* ═══ COMPETITIVE ADVANTAGES ═══ */}
        {brief.competitiveAdvantages && (brief.competitiveAdvantages as string[]).length > 0 && (
          <motion.section custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <SectionHeader number="02" title="Competitive Advantages" icon={Award} />
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

        {/* ═══ STRATEGIC RECOMMENDATIONS ═══ */}
        {brief.strategicRecommendations && (brief.strategicRecommendations as any[]).length > 0 && (
          <motion.section custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <SectionHeader number="03" title="Strategic Recommendations" icon={Zap} />
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

        {/* ═══ RISK FACTORS ═══ */}
        {brief.riskFactors && (brief.riskFactors as any[]).length > 0 && (
          <motion.section custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <SectionHeader number="04" title="Risk Factors" icon={AlertTriangle} />
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

        {/* ═══ OPPORTUNITIES ═══ */}
        {brief.opportunities && (brief.opportunities as any[]).length > 0 && (
          <motion.section custom={5} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
            <SectionHeader number="05" title="Opportunities" icon={TrendingUp} />
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

        {/* ═══ FOOTER ═══ */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="pt-8 pb-4 text-center border-t border-border/30">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
            <Sparkles className="w-3.5 h-3.5 text-primary/40" />
            Generated by STRATIX AI — Competitive Positioning Intelligence
          </div>
        </motion.div>
      </main>
    </div>
  );
}
