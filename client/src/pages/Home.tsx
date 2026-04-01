import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Target, Search, FileText, Shield, Compass, Swords,
  Zap, BarChart3, Globe, Sparkles, TrendingUp, Brain, Users, Clock,
  CheckCircle, ChevronDown, Lock, Award, Radar, Layers, GitBranch,
  Activity, Eye, Star,
} from "lucide-react";
import { useLocation } from "wouter";

/* ─── Animated Counter ─── */
function Counter({ to, suffix = "", prefix = "", duration = 2.2 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = Math.round(duration * 60);
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * to));
      if (frame === totalFrames) { setCount(to); clearInterval(counter); }
    }, 1000 / 60);
    return () => clearInterval(counter);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ─── Marquee ─── */
function Marquee({ items }: { items: { label: string; icon: any }[] }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to right, white, transparent)", zIndex: 10, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(to left, white, transparent)", zIndex: 10, pointerEvents: "none" }} />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", width: "max-content", gap: 0 }}
      >
        {doubled.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 32px", whiteSpace: "nowrap", borderRight: "1px solid #f0f0f0" }}>
            <item.icon style={{ width: 16, height: 16, color: "#8b5cf6", flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ fontSize: 17, fontWeight: 600, color: "#0f172a" }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown style={{ width: 20, height: 20, color: "#94a3b8" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, paddingBottom: 22 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.09 } } };

const GRADIENT_TEXT: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a855f7 70%, #ec4899 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const GLOW_TEXT: React.CSSProperties = {
  ...GRADIENT_TEXT,
  filter: "drop-shadow(0 0 32px rgba(139, 92, 246, 0.45))",
};

const CARD_STYLE: React.CSSProperties = {
  background: "white",
  borderRadius: 20,
  border: "1px solid #f1f5f9",
  boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
  padding: 32,
};

const GLASS_CARD: React.CSSProperties = {
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.9)",
  boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
};

const marqueItems = [
  { label: "Competitor Discovery", icon: Search },
  { label: "Threat Scoring", icon: Radar },
  { label: "Territory Mapping", icon: Layers },
  { label: "Strategic Briefs", icon: FileText },
  { label: "Market Intelligence", icon: Brain },
  { label: "Positioning Analysis", icon: Compass },
  { label: "Risk Assessment", icon: Shield },
  { label: "Growth Opportunities", icon: TrendingUp },
  { label: "Executive Reports", icon: Award },
  { label: "Real-time Insights", icon: Activity },
];

const stats = [
  { value: 12400, suffix: "+", label: "Competitors Analyzed", icon: Search },
  { value: 840, suffix: "+", label: "Companies Served", icon: Users },
  { value: 97, suffix: "%", label: "Analysis Accuracy", icon: Target },
  { value: 8, suffix: " min", label: "Avg. Brief Time", icon: Clock },
];

const features = [
  { icon: Search, title: "AI Competitor Discovery", desc: "Automatically surface direct competitors, emerging threats, and adjacent players from your URL alone. No manual research needed.", color: "#6366f1", bg: "rgba(99,102,241,0.06)" },
  { icon: BarChart3, title: "20-Point Threat Scoring", desc: "Each competitor is scored on a rigorous 20-point scale — rated Critical, High, Moderate, or Low — so you know exactly who to watch.", color: "#8b5cf6", bg: "rgba(139,92,246,0.06)" },
  { icon: Layers, title: "Territory Mapping", desc: "Visualize the competitive battlefield: Owned, Contested, Unoccupied, and Indefensible positions mapped clearly.", color: "#a855f7", bg: "rgba(168,85,247,0.06)" },
  { icon: FileText, title: "Strategic Briefs", desc: "AI-generated executive positioning briefs with actionable recommendations, risk factors, and market opportunities.", color: "#ec4899", bg: "rgba(236,72,153,0.06)" },
  { icon: GitBranch, title: "Market Positioning", desc: "Understand exactly where you stand, where the gaps are, and how to claim defensible market territory before competitors do.", color: "#10b981", bg: "rgba(16,185,129,0.06)" },
  { icon: Lock, title: "Private & Secure", desc: "Your competitive data stays yours. Projects are private by default with optional public report sharing.", color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
];

const steps = [
  { n: "01", icon: Target, title: "Define Your Market", desc: "Enter your company URL. Our AI reads your website, extracts your value proposition, industry, and competitive context in seconds.", color: "#6366f1" },
  { n: "02", icon: Search, title: "Discover Competitors", desc: "The AI surfaces your true competitive landscape — direct rivals, emerging threats, and indirect competitors you might have missed.", color: "#8b5cf6" },
  { n: "03", icon: Shield, title: "Map the Battlefield", desc: "Territory analysis plots every competitive position: what you own, what's contested, and where unoccupied white space exists.", color: "#a855f7" },
  { n: "04", icon: FileText, title: "Get Your Brief", desc: "A full strategic positioning brief lands in minutes — executive summary, recommendations, risk factors, and a shareable report.", color: "#ec4899" },
];

const testimonials = [
  { name: "Sarah Chen", role: "VP Strategy, Nexus Labs", text: "We used to spend weeks on competitive analysis. STRATIX AI does it in minutes and the territory mapping is something our team actually acts on.", stars: 5 },
  { name: "Marcus Deville", role: "Founder, Orbita SaaS", text: "The threat scoring alone is worth it. I finally know which competitors to ignore and which ones to actively counter. Game-changer for our GTM.", stars: 5 },
  { name: "Priya Nair", role: "Head of Product, Elevate Co", text: "The public report feature is brilliant — I share the brief directly with investors. It looks incredibly professional and saves us hours every quarter.", stars: 5 },
];

const faqs = [
  { q: "How does the AI discover competitors?", a: "Our AI reads your company URL to understand your product, market, and value proposition. It then uses this context to surface direct competitors, adjacent players, and emerging threats using large language models trained on market data." },
  { q: "How accurate is the threat scoring?", a: "The 20-point threat scoring system evaluates competitors across multiple dimensions including market presence, funding, feature overlap, and growth signals. It achieves ~97% alignment with expert human assessments in our benchmark tests." },
  { q: "Can I share my report publicly?", a: "Yes. Each project has a toggle to make the strategic brief publicly accessible via a unique URL. This is perfect for sharing with investors, board members, or external stakeholders." },
  { q: "How long does a full analysis take?", a: "Most full analyses complete in 5–10 minutes, depending on the complexity of your market. The results include competitor discovery, territory mapping, and a complete strategic brief." },
  { q: "Is my data private?", a: "Absolutely. All projects are private by default and only accessible to your account. You control if and when a report is made public." },
];

const threatData = [
  { name: "CompetitorAlpha", score: 18, level: "CRITICAL", color: "#ef4444", bar: "#fef2f2", border: "#fecaca" },
  { name: "MarketRival Pro", score: 14, level: "HIGH", color: "#f97316", bar: "#fff7ed", border: "#fed7aa" },
  { name: "StartupX", score: 9, level: "MODERATE", color: "#f59e0b", bar: "#fffbeb", border: "#fde68a" },
  { name: "NichePlayer", score: 4, level: "LOW", color: "#10b981", bar: "#ecfdf5", border: "#a7f3d0" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (user) setLocation("/dashboard");
    else window.location.href = getLoginUrl("/dashboard");
  };

  return (
    <div style={{ background: "#ffffff", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>

      {/* ═══ NAV ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)",
          height: 68,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }}>
              <Sparkles style={{ width: 18, height: 18, color: "white" }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a" }}>STRATIX</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 20, letterSpacing: "0.05em" }}>AI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!loading && (user ? (
              <Button onClick={() => setLocation("/dashboard")} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, height: 40, padding: "0 20px", fontWeight: 600, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                Dashboard <ArrowRight style={{ width: 15, height: 15, marginLeft: 6 }} />
              </Button>
            ) : (
              <>
                <button onClick={() => { window.location.href = getLoginUrl(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 16px", fontSize: 14, fontWeight: 500, color: "#475569", borderRadius: 8 }}>Sign in</button>
                <Button onClick={handleGetStarted} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, height: 40, padding: "0 20px", fontWeight: 600, boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}>
                  Get Started <ArrowRight style={{ width: 15, height: 15, marginLeft: 6 }} />
                </Button>
              </>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 68 }}>
        {/* Animated background orbs */}
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: "2%", left: "2%", width: 680, height: 680, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(99,102,241,0.04) 55%, transparent 75%)", pointerEvents: "none" }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          style={{ position: "absolute", top: "15%", right: "-5%", width: 780, height: 780, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(139,92,246,0.04) 55%, transparent 75%)", pointerEvents: "none" }}
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{ position: "absolute", bottom: "5%", left: "28%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)", pointerEvents: "none" }}
        />
        {/* Extra glow spot — top center */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: "absolute", top: "0%", left: "40%", width: 400, height: 260, borderRadius: "0 0 50% 50%", background: "radial-gradient(ellipse at center top, rgba(139,92,246,0.22) 0%, transparent 70%)", pointerEvents: "none" }}
        />
        {/* Subtle dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.55, pointerEvents: "none" }} />
        {/* Shimmer sweep lines */}
        <motion.div
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
          style={{ position: "absolute", top: "38%", left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), rgba(99,102,241,0.35), rgba(139,92,246,0.2), transparent)", pointerEvents: "none" }}
        />
        <motion.div
          animate={{ x: ["-100%", "220%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 5 }}
          style={{ position: "absolute", top: "70%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.15), rgba(236,72,153,0.25), rgba(168,85,247,0.15), transparent)", pointerEvents: "none" }}
        />
        {/* Glowing particle dots */}
        {[
          { top: "22%", left: "8%", size: 5, color: "rgba(99,102,241,0.6)", delay: 0 },
          { top: "55%", left: "12%", size: 4, color: "rgba(168,85,247,0.5)", delay: 1.5 },
          { top: "75%", left: "45%", size: 6, color: "rgba(139,92,246,0.5)", delay: 0.8 },
          { top: "18%", right: "18%", size: 4, color: "rgba(236,72,153,0.45)", delay: 2 },
          { top: "60%", right: "10%", size: 5, color: "rgba(99,102,241,0.4)", delay: 3 },
          { top: "85%", left: "20%", size: 3, color: "rgba(168,85,247,0.5)", delay: 1 },
        ].map((p, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            style={{ position: "absolute", top: p.top, left: (p as any).left, right: (p as any).right, width: p.size, height: p.size, borderRadius: "50%", background: p.color, boxShadow: `0 0 ${p.size * 4}px ${p.color}`, pointerEvents: "none" }}
          />
        ))}

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px", position: "relative", zIndex: 10, width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0} style={{ marginBottom: 24 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 40, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 13, fontWeight: 600, color: "#6366f1" }}>
                  <Zap style={{ width: 14, height: 14 }} />
                  AI-Powered Competitive Intelligence
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: "pulse 2s infinite" }} />
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1} style={{ fontSize: "clamp(44px, 5.5vw, 76px)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", color: "#0f172a", marginBottom: 24 }}>
                Know your market.<br />
                <span style={GLOW_TEXT}>Own your position.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} style={{ fontSize: 18, color: "#64748b", lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
                STRATIX AI discovers your competitors, maps the competitive battlefield, and generates strategic positioning briefs — giving your team an unfair advantage.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={handleGetStarted} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(99,102,241,0.2)", letterSpacing: "-0.01em" }}>
                  Start Analyzing Free
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </button>
                <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 28px", borderRadius: 14, background: "white", color: "#374151", border: "1.5px solid #e2e8f0", cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  See How It Works
                </button>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} style={{ display: "flex", gap: 28, marginTop: 40, paddingTop: 32, borderTop: "1px solid #f1f5f9" }}>
                {[{ value: "10K+", label: "Competitors Mapped" }, { value: "97%", label: "Accuracy Rate" }, { value: "8 min", label: "Avg Brief Time" }].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right – floating dashboard preview */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ position: "relative" }}>
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ ...GLASS_CARD, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Radar style={{ width: 16, height: 16, color: "white" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Competitive Analysis</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Acme Corp · Global</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(16,185,129,0.2)" }}>● Live</span>
                </div>

                {threatData.map((t, i) => (
                  <motion.div key={t.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }} style={{ background: t.bar, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{t.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.color, background: "white", padding: "2px 8px", borderRadius: 6, border: `1px solid ${t.border}` }}>{t.level}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: t.color }}>{t.score}<span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>/20</span></span>
                      </div>
                    </div>
                    <div style={{ height: 5, background: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(t.score / 20) * 100}%` }} transition={{ delay: 0.8 + i * 0.15, duration: 0.8 }} style={{ height: "100%", background: t.color, borderRadius: 3 }} />
                    </div>
                  </motion.div>
                ))}

                <div style={{ marginTop: 16, padding: "14px 16px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))", borderRadius: 12, border: "1px solid rgba(99,102,241,0.12)" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 500 }}>Overall Competitive Score</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, ...GRADIENT_TEXT }}>14.2</span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>/20 · HIGH threat market</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} style={{ position: "absolute", top: -24, right: -20, ...GLASS_CARD, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Brain style={{ width: 16, height: 16, color: "#8b5cf6" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>AI Brief Generated</span>
                <CheckCircle style={{ width: 14, height: 14, color: "#10b981" }} />
              </motion.div>

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: "absolute", bottom: -20, left: -24, ...GLASS_CARD, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <Globe style={{ width: 16, height: 16, color: "#6366f1" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>3 territories unclaimed</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "18px 0", background: "#fafafa", overflow: "hidden" }}>
        <Marquee items={marqueItems} />
      </div>

      {/* ═══ STATS ═══ */}
      <section style={{ padding: "96px 32px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Trusted by Strategists</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Numbers that prove <span style={GRADIENT_TEXT}>the difference</span>
            </motion.h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {stats.map((s, i) => (
              <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} style={{ ...CARD_STYLE, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)" }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <s.icon style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                </div>
                <div style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", ...GRADIENT_TEXT, lineHeight: 1 }}>
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 14, color: "#64748b", marginTop: 10, fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: "96px 32px", background: "linear-gradient(180deg, #fafafa 0%, white 100%)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 80 }}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How It Works</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              From URL to strategy <span style={GRADIENT_TEXT}>in minutes</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} style={{ fontSize: 17, color: "#64748b", marginTop: 16, maxWidth: 520, margin: "16px auto 0" }}>
              No setup, no manual research. Just paste your URL and let the AI do the heavy lifting.
            </motion.p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {steps.map((step, i) => (
              <motion.div key={step.n} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp} custom={i}
                whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(99,102,241,0.12)" }}
                style={{ ...CARD_STYLE, position: "relative", cursor: "default", transition: "all 0.3s" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${step.color}, ${step.color}88)`, borderRadius: "20px 20px 0 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <span style={{ fontSize: 48, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.04em", lineHeight: 1 }}>{step.n}</span>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${step.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.icon style={{ width: 22, height: 22, color: step.color }} />
                  </div>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section style={{ padding: "96px 32px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Capabilities</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Intelligence that <span style={GRADIENT_TEXT}>drives decisions</span>
            </motion.h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                whileHover={{ y: -4, boxShadow: `0 16px 48px ${f.color}18` }}
                style={{ ...CARD_STYLE, display: "flex", gap: 18, alignItems: "flex-start", transition: "all 0.3s" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${f.color}20` }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.01em" }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TERRITORY SHOWCASE ═══ */}
      <section style={{ padding: "96px 32px", background: "linear-gradient(135deg, #fafafa 0%, #f5f3ff 50%, #faf5ff 100%)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Territory Mapping</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
              See the battlefield <span style={GLOW_TEXT}>before you fight</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} style={{ fontSize: 16, color: "#64748b", lineHeight: 1.75, marginBottom: 36 }}>
              Our AI maps every competitive position in your market. Identify where you're winning, where battles are being fought, and where no one has planted a flag yet.
            </motion.p>
            {[
              { icon: Shield, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Owned", desc: "Positions you clearly dominate" },
              { icon: Compass, color: "#6366f1", bg: "rgba(99,102,241,0.1)", label: "Unoccupied", desc: "White space nobody has claimed" },
              { icon: Swords, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Contested", desc: "Battles worth fighting (or avoiding)" },
            ].map((t, i) => (
              <motion.div key={t.label} variants={fadeUp} custom={i + 3} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <t.icon style={{ width: 18, height: 18, color: t.color }} />
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.label} — </span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>{t.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ ...CARD_STYLE, padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Territory Map · Acme Corp</div>
              {[
                { type: "Owned", label: "AI-native workflow automation", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: Shield, pct: 78 },
                { type: "Owned", label: "SMB market segment leadership", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: Shield, pct: 65 },
                { type: "Unoccupied", label: "Healthcare vertical integration", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: Compass, pct: 0 },
                { type: "Contested", label: "Enterprise API ecosystem", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: Swords, pct: 45 },
                { type: "Contested", label: "Real-time analytics layer", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: Swords, pct: 38 },
              ].map((row, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                  style={{ background: row.bg, border: `1px solid ${row.border}`, borderRadius: 12, padding: "13px 16px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: row.type !== "Unoccupied" ? 8 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <row.icon style={{ width: 13, height: 13, color: row.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: row.color, background: "white", padding: "2px 8px", borderRadius: 6 }}>{row.type}</span>
                  </div>
                  {row.type !== "Unoccupied" && (
                    <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${row.pct}%` }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.1, duration: 0.7 }} style={{ height: "100%", background: row.color, borderRadius: 2 }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: "96px 32px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 64 }}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Testimonials</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(28px, 3.5vw, 46px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
              What strategists <span style={GRADIENT_TEXT}>are saying</span>
            </motion.h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                whileHover={{ y: -4 }}
                style={{ ...CARD_STYLE, transition: "all 0.3s" }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} style={{ width: 15, height: 15, color: "#f59e0b", fill: "#f59e0b" }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 15, fontWeight: 700 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: "96px 32px", background: "#fafafa" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 56 }}>
            <motion.p variants={fadeUp} custom={0} style={{ fontSize: 13, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>FAQ</motion.p>
            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
              Questions <span style={GRADIENT_TEXT}>answered</span>
            </motion.h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{ padding: "120px 32px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div style={{ position: "absolute", top: "20%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} custom={0} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 40, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: 28 }}>
              <Sparkles style={{ width: 14, height: 14, color: "#a78bfa" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>Start free · No credit card required</span>
            </motion.div>

            <motion.h2 variants={fadeUp} custom={1} style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", color: "white", marginBottom: 20 }}>
              Map your competitive
              <br />
              <span style={{ ...GLOW_TEXT, filter: "drop-shadow(0 0 40px rgba(139,92,246,0.6))" }}>landscape today</span>
            </motion.h2>

            <motion.p variants={fadeUp} custom={2} style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 44, maxWidth: 480, margin: "0 auto 44px" }}>
              Enter your URL. Get a full competitive brief in under 10 minutes. No setup, no spreadsheets.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <button onClick={handleGetStarted} style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 40px", borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", border: "none", cursor: "pointer", fontSize: 17, fontWeight: 700, boxShadow: "0 8px 40px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.3)", letterSpacing: "-0.01em" }}>
                Start Analyzing Free
                <ArrowRight style={{ width: 19, height: 19 }} />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} custom={4} style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 44 }}>
              {[
                { icon: CheckCircle, text: "No credit card" },
                { icon: Lock, text: "Private by default" },
                { icon: Zap, text: "Results in minutes" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <item.icon style={{ width: 14, height: 14, color: "#a78bfa" }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#0a0f1e", padding: "40px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>STRATIX AI</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Competitive intelligence, reimagined.</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>© {new Date().getFullYear()} Stratix AI</p>
        </div>
      </footer>
    </div>
  );
}
