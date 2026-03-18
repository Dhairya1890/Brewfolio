import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Code2, FileText, Check, Copy } from "lucide-react";
import type { BuilderState } from "@/pages/Build";
import { toast } from "sonner";
import { getAccentBgColor, getAccentTextColor, getAccentBorderColor } from "@/utils/theme";

const accentColors = [
  { key: "violet", color: "bg-accent-violet" },
  { key: "cyan", color: "bg-accent-cyan" },
  { key: "green", color: "bg-green-500" },
  { key: "orange", color: "bg-orange-500" },
  { key: "rose", color: "bg-rose-500" },
  { key: "mono", color: "bg-foreground" },
];

interface Props {
  state: BuilderState;
  setState: (s: BuilderState) => void;
}

const StepPreview = ({ state, setState }: Props) => {
  const [celebrating, setCelebrating] = useState(false);

  const handlePublish = () => {
    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 3000);
  };

  const username = state.profiles.github || "yourname";

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Left Sidebar */}
      <div className="lg:w-[35%] space-y-8">
        <div>
          <h2 className="font-syne font-bold text-2xl text-foreground">Looking good.</h2>
          <p className="font-dm text-text-secondary text-sm mt-1">
            Make any final changes before publishing.
          </p>
        </div>

        {/* Quick Edits */}
        <div className="space-y-5">
          <div>
            <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-2 block">
              Display Name
            </label>
            <input
              type="text"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder={username}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 font-mono text-sm text-foreground placeholder:text-text-tertiary outline-none focus:border-[hsl(var(--border-active))] transition-all"
            />
          </div>

          <div>
            <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-2 block">
              Accent Color
            </label>
            <div className="flex gap-3">
              {accentColors.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setState({ ...state, accentColor: c.key })}
                  className={`w-8 h-8 rounded-full ${c.color} transition-all ${
                    state.accentColor === c.key
                      ? "ring-2 ring-accent-cyan ring-offset-2 ring-offset-void"
                      : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-2 block">
              Font Size
            </label>
            <div className="flex gap-2">
              {["small", "medium", "large"].map((s) => (
                <button
                  key={s}
                  onClick={() => setState({ ...state, fontSize: s })}
                  className={`px-4 py-2 rounded-lg text-sm font-dm border transition-all ${
                    state.fontSize === s
                      ? "bg-accent-violet/20 border-accent-violet/40 text-foreground"
                      : "bg-elevated border-border text-text-secondary"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-2 block">
              Sections
            </label>
            <div className="flex flex-wrap gap-2">
              {state.features.map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-lg bg-accent-violet/20 border border-accent-violet/40 text-xs font-dm text-foreground"
                >
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-6">
          <p className="font-syne font-semibold text-foreground mb-4">You're ready.</p>

          <div className="space-y-3">
            <button
              onClick={handlePublish}
              className="w-full btn-gradient text-primary-foreground font-syne font-semibold py-3.5 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Publish →
            </button>
            <button
              onClick={() => toast.success("Download started!")}
              className="w-full border border-accent-violet/30 text-foreground font-dm py-3 rounded-xl hover:bg-accent-violet/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Code2 className="w-4 h-4" />
              Download .zip
            </button>
            <button
              onClick={() => toast.success("PDF generation started!")}
              className="w-full border border-accent-cyan/30 text-foreground font-dm py-3 rounded-xl hover:bg-accent-cyan/5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Full Preview */}
      <div className="lg:w-[65%]">
        <div className="bg-surface border border-border rounded-2xl shadow-[0_0_40px_hsl(263,84%,58%,0.08)] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-elevated rounded-md px-3 py-1 text-xs font-mono text-text-tertiary max-w-xs">
                devfolio.sh/{username}
              </div>
            </div>
          </div>

          <div className={`p-8 min-h-[600px] space-y-8 theme-${state.theme}`}>
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-opacity-20 ${getAccentBgColor(state.accentColor).replace('bg-', 'bg-opacity-20 bg-')}`}>
                <span className={`font-syne text-3xl font-bold ${getAccentTextColor(state.accentColor)}`}>
                  {username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-syne text-2xl font-bold text-foreground">
                  {state.name || `@${username}`}
                </h2>
                <p className="font-dm text-sm text-text-secondary mt-1">
                  Full-stack developer passionate about building tools that matter.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Repos", value: "42" },
                { label: "Contributions", value: "1,247" },
                { label: "Stars", value: "186" },
              ].map((s) => (
                <div key={s.label} className="theme-card p-4 text-center">
                  <div className="font-syne text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="font-dm text-xs text-text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-syne font-bold text-foreground mb-3">Top Projects</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {["cloud-sync", "ml-pipeline", "chat-app", "devfolio"].map((p) => (
                  <div key={p} className="theme-card p-4 hover:border-[hsl(var(--border-hover))] transition-colors">
                    <div className="font-mono text-sm text-foreground font-medium">{p}</div>
                    <div className="font-dm text-xs text-text-secondary mt-1">
                      A well-crafted project with clean architecture.
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-mono text-accent-cyan">TypeScript</span>
                      <span className="text-[10px] font-mono text-text-tertiary">★ 24</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-syne font-bold text-foreground mb-3">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {["TypeScript", "React", "Node.js", "Python", "Go", "PostgreSQL", "Docker", "AWS"].map((s) => (
                  <span key={s} className={`px-3 py-1 rounded-lg text-xs font-mono text-foreground bg-opacity-10 border ${getAccentBgColor(state.accentColor).replace('bg-', 'bg-opacity-10 bg-')} ${getAccentBorderColor(state.accentColor)}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 bg-void/95 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-accent-cyan/20 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-accent-cyan" />
              </motion.div>
              <h2 className="font-syne font-extrabold text-4xl text-foreground mb-4">
                You're live.
              </h2>
              <div className="flex items-center gap-2 justify-center bg-surface border border-border rounded-xl px-6 py-3">
                <span className="font-mono text-accent-cyan text-sm">
                  devfolio.sh/{username}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`devfolio.sh/${username}`);
                    toast.success("URL copied!");
                  }}
                  className="text-text-secondary hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                }}
                transition={{ duration: 2.5, delay: Math.random() * 0.5 }}
                className={`absolute w-2 h-2 rounded-full ${
                  i % 3 === 0
                    ? "bg-accent-violet"
                    : i % 3 === 1
                    ? "bg-accent-cyan"
                    : "bg-accent-pink"
                }`}
                style={{ left: "50%", top: "50%" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepPreview;
