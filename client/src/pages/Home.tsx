import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Target,
  Search,
  FileText,
  Shield,
  Compass,
  Swords,
  Zap,
  BarChart3,
  Globe,
  Sparkles,
} from "lucide-react";
import { useLocation } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      window.location.href = getLoginUrl("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              STRATIX
            </span>
            <span className="text-xs font-medium text-primary px-1.5 py-0.5 rounded-full bg-primary/10">
              AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <Button onClick={() => setLocation("/dashboard")} size="sm">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { window.location.href = getLoginUrl(); }}
                >
                  Sign in
                </Button>
                <Button size="sm" onClick={handleGetStarted}>
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden stratix-mesh-bg">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{ background: "radial-gradient(circle, oklch(0.6 0.2 270 / 0.3), transparent)" }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, oklch(0.6 0.18 290 / 0.3), transparent)" }} />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15">
                <Zap className="w-3 h-3" />
                AI-Powered Competitive Intelligence
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Know your market.
              <br />
              <span className="stratix-glow stratix-glow-hover">
                Own your position.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              STRATIX AI discovers your competitors, maps the battlefield, and generates
              strategic positioning briefs that give you an unfair advantage.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={handleGetStarted} className="h-12 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Start Analyzing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} className="h-12 px-8 text-base">
                See How It Works
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - 3 Step Journey */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Three steps to strategic clarity
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                title: "Define",
                description: "Enter your company URL and tell us about your market. Our AI extracts your business context and identifies your competitive landscape.",
                icon: Target,
                gradient: "from-violet-500/10 to-purple-500/10",
              },
              {
                step: "02",
                title: "Discover",
                description: "AI discovers and scores your competitors on a 20-point threat scale. See who matters, who's dangerous, and where the gaps are.",
                icon: Search,
                gradient: "from-blue-500/10 to-cyan-500/10",
              },
              {
                step: "03",
                title: "Brief",
                description: "Get a strategic positioning brief with territory mapping, competitive advantages, and actionable recommendations.",
                icon: FileText,
                gradient: "from-emerald-500/10 to-teal-500/10",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i}
                className="stratix-card p-8 relative group"
              >
                <div className={`absolute inset-0 rounded-[var(--radius-xl)] bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold text-primary/40 tracking-widest">{item.step}</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 stratix-mesh-bg">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
              Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Intelligence that drives decisions
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Search, title: "Competitor Discovery", desc: "AI identifies direct competitors, emerging threats, and adjacent players in your market." },
              { icon: BarChart3, title: "Threat Scoring", desc: "Each competitor scored 1-20 with threat level classification: Critical, High, Moderate, Low." },
              { icon: Shield, title: "Owned Territories", desc: "Map positions you clearly dominate and understand your defensive moats." },
              { icon: Compass, title: "Unoccupied Space", desc: "Discover white space opportunities that no competitor has claimed yet." },
              { icon: Swords, title: "Contested Positions", desc: "Identify battleground positions where multiple players are fighting." },
              { icon: Globe, title: "Strategic Briefs", desc: "AI-generated executive briefs with scoring, recommendations, and risk analysis." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="stratix-card p-6 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to map your{" "}
              <span className="stratix-glow">competitive landscape</span>?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start with your company URL. Get a complete competitive intelligence brief in minutes.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button size="lg" onClick={handleGetStarted} className="h-12 px-10 text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>STRATIX AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Competitive intelligence, reimagined.
          </p>
        </div>
      </footer>
    </div>
  );
}
