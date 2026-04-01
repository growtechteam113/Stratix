import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Eye, EyeOff, User, Mail, Lock, Search, BarChart3, Layers, FileText, Shield, Brain } from "lucide-react";

/* ─── Glass morphism styles ─── */
const GLASS: React.CSSProperties = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(32px)",
  WebkitBackdropFilter: "blur(32px)",
  border: "1.5px solid rgba(255,255,255,0.85)",
  boxShadow: "0 8px 48px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
};

const GLASS_INPUT: React.CSSProperties = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1.5px solid rgba(226,232,240,0.8)",
  borderRadius: 14,
  height: 52,
  width: "100%",
  padding: "0 44px 0 16px",
  fontSize: 15,
  color: "#0f172a",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const BTN_PRIMARY: React.CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)",
  border: "none",
  cursor: "pointer",
  color: "white",
  fontSize: 16,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  letterSpacing: "-0.01em",
  boxShadow: "0 8px 32px rgba(99,102,241,0.38), 0 2px 8px rgba(99,102,241,0.2)",
  transition: "opacity 0.2s, transform 0.15s",
};

/* ─── Floating feature pill ─── */
function FeaturePill({ icon: Icon, label, style }: { icon: any; label: string; style: React.CSSProperties }) {
  return (
    <div style={{
      ...GLASS,
      position: "absolute",
      borderRadius: 40,
      padding: "9px 16px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
      ...style,
    }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon style={{ width: 13, height: 13, color: "white" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
    </div>
  );
}

/* ─── Input wrapper with icon ─── */
function FloatingInput({
  id, type = "text", placeholder, value, onChange, icon: Icon, rightSlot, required, minLength,
}: {
  id: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: any; rightSlot?: React.ReactNode;
  required?: boolean; minLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Icon style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: focused ? "#8b5cf6" : "#94a3b8", transition: "color 0.2s", pointerEvents: "none", zIndex: 2 }} />
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...GLASS_INPUT,
          paddingLeft: 42,
          borderColor: focused ? "rgba(139,92,246,0.5)" : "rgba(226,232,240,0.8)",
          boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
        }}
      />
      {rightSlot && (
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}

/* ─── Animated orb background ─── */
function OrbBg() {
  return (
    <>
      {/* Main gradient orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "-10%", right: "-5%", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.06) 50%, transparent 75%)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: "absolute", bottom: "-15%", left: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(168,85,247,0.06) 50%, transparent 75%)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{ position: "absolute", top: "40%", left: "30%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", pointerEvents: "none" }}
      />
      {/* Grid pattern */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)", backgroundSize: "44px 44px", opacity: 0.6, pointerEvents: "none" }} />
      {/* Shimmer lines */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 }}
        style={{ position: "absolute", top: "35%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), rgba(99,102,241,0.25), rgba(139,92,246,0.15), transparent)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 3.5 }}
        style={{ position: "absolute", top: "65%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.12), rgba(139,92,246,0.2), rgba(168,85,247,0.12), transparent)", pointerEvents: "none" }}
      />
    </>
  );
}

export default function Login() {
  const [, setLocation] = useLocation();
  const returnPath = new URLSearchParams(window.location.search).get("returnPath") || "/dashboard";
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.token) localStorage.setItem("stratix-session", data.token);
      setLocation(returnPath);
    },
    onError: (err) => toast.error(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.token) localStorage.setItem("stratix-session", data.token);
      setLocation(returnPath);
    },
    onError: (err) => toast.error(err.message),
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", overflow: "hidden", position: "relative", padding: "24px 16px" }}>
      <OrbBg />

      {/* ── Back to Home nav ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: "fixed", top: 20, left: 24, zIndex: 50 }}
      >
        <button
          onClick={() => setLocation("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.85)", borderRadius: 40, padding: "8px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 12, height: 12, color: "white" }} />
          </div>
          STRATIX
        </button>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1020, width: "100%", gap: 32, position: "relative", zIndex: 10 }}>

        {/* ── Left panel: brand + features ── */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 0", position: "relative" }}
          className="login-left-panel"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 40, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", fontSize: 12, fontWeight: 600, color: "#6366f1", marginBottom: 28, width: "fit-content" }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 6px rgba(99,102,241,0.7)" }} />
            AI-Powered Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{ fontSize: "clamp(32px, 3.5vw, 52px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.04em", color: "#0f172a", marginBottom: 16 }}
          >
            Outsmart your<br />
            <span style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: "drop-shadow(0 0 24px rgba(139,92,246,0.35))" }}>
              competition.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 16, color: "#64748b", lineHeight: 1.7, marginBottom: 40, maxWidth: 380 }}
          >
            Join thousands of founders and strategists using STRATIX AI to map competitive landscapes and win their markets.
          </motion.p>

          {/* Feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: Search, label: "AI Competitor Discovery", desc: "Surface rivals from your URL alone", color: "#6366f1" },
              { icon: BarChart3, label: "20-Point Threat Scoring", desc: "Know who to watch and who to ignore", color: "#8b5cf6" },
              { icon: Layers, label: "Territory Mapping", desc: "See owned, contested & unoccupied positions", color: "#a855f7" },
              { icon: FileText, label: "Strategic Briefs", desc: "Executive positioning reports in minutes", color: "#ec4899" },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.09 }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${f.color}22, ${f.color}44)`, border: `1px solid ${f.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <f.icon style={{ width: 18, height: 18, color: f.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{f.label}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating pills */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: 20, right: -10, display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 40, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 16px rgba(99,102,241,0.12)" }}
          >
            <Brain style={{ width: 14, height: 14, color: "#8b5cf6" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Brief in 8 min</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            style={{ position: "absolute", bottom: 60, right: -20, display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 40, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 4px 16px rgba(16,185,129,0.12)" }}
          >
            <Shield style={{ width: 14, height: 14, color: "#10b981" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>97% accuracy</span>
          </motion.div>
        </motion.div>

        {/* ── Right panel: auth form ── */}
        <motion.div
          initial={{ opacity: 0, x: 32, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          style={{ ...GLASS, borderRadius: 28, padding: 40, display: "flex", flexDirection: "column" }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
              <Sparkles style={{ width: 20, height: 20, color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a" }}>STRATIX <span style={{ color: "#8b5cf6" }}>AI</span></div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: -1 }}>Competitive Intelligence</div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(241,245,249,0.7)", borderRadius: 14, padding: 4, marginBottom: 32, gap: 2 }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  height: 40, borderRadius: 11, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                  background: tab === t ? "white" : "transparent",
                  color: tab === t ? "#0f172a" : "#94a3b8",
                  boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(loginForm); }}
                style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}
              >
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Email</label>
                  <FloatingInput id="login-email" type="email" placeholder="you@example.com" value={loginForm.email} onChange={v => setLoginForm(f => ({ ...f, email: v }))} icon={Mail} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Password</label>
                  <FloatingInput
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={v => setLoginForm(f => ({ ...f, password: v }))}
                    icon={Lock}
                    required
                    rightSlot={
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94a3b8", display: "flex" }}>
                        {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    }
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  style={{ ...BTN_PRIMARY, marginTop: 8, opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                  ) : (
                    <>Sign In <ArrowRight style={{ width: 17, height: 17 }} /></>
                  )}
                </motion.button>

                <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => setTab("register")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", fontWeight: 600, fontSize: 13, padding: 0 }}>
                    Sign up free
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(registerForm); }}
                style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}
              >
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Full Name</label>
                  <FloatingInput id="register-name" placeholder="Jane Smith" value={registerForm.name} onChange={v => setRegisterForm(f => ({ ...f, name: v }))} icon={User} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Email</label>
                  <FloatingInput id="register-email" type="email" placeholder="you@example.com" value={registerForm.email} onChange={v => setRegisterForm(f => ({ ...f, email: v }))} icon={Mail} required />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Password</label>
                  <FloatingInput
                    id="register-password"
                    type={showRegPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={registerForm.password}
                    onChange={v => setRegisterForm(f => ({ ...f, password: v }))}
                    icon={Lock}
                    required
                    minLength={8}
                    rightSlot={
                      <button type="button" onClick={() => setShowRegPass(!showRegPass)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#94a3b8", display: "flex" }}>
                        {showRegPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    }
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  style={{ ...BTN_PRIMARY, marginTop: 8, opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                  ) : (
                    <>Create Free Account <ArrowRight style={{ width: 17, height: 17 }} /></>
                  )}
                </motion.button>

                <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                  Already have an account?{" "}
                  <button type="button" onClick={() => setTab("login")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", fontWeight: 600, fontSize: 13, padding: 0 }}>
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Trust badges */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(241,245,249,0.8)" }}>
            {[
              { icon: Shield, label: "Secure" },
              { icon: Brain, label: "AI-Powered" },
              { icon: FileText, label: "Instant Brief" },
            ].map(({ icon: Ic, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
                <Ic style={{ width: 13, height: 13, color: "#8b5cf6" }} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Responsive: hide left panel on small screens */}
      <style>{`
        @media (max-width: 700px) {
          .login-left-panel { display: none !important; }
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            max-width: 460px !important;
          }
        }
      `}</style>
    </div>
  );
}
