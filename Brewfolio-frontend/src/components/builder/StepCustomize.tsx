import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Zap, GitBranch, User, Monitor, Smartphone } from "lucide-react";
import type { BuilderState } from "@/pages/Build";

const portfolioTypes = [
  { key: "job", label: "Job Seeking", icon: Briefcase },
  { key: "freelance", label: "Freelance", icon: Zap },
  { key: "opensource", label: "Open Source", icon: GitBranch },
  { key: "personal", label: "Personal Brand", icon: User },
];

const allFeatures = [
  "Projects", "Skills", "Stats", "Blog", "GitHub Activity",
  "Testimonials", "Resume / CV", "Contact Form", "Timeline",
];

const themes = [
  { key: "minimal", label: "Minimal" },
  { key: "terminal", label: "Terminal" },
  { key: "magazine", label: "Magazine" },
  { key: "glass", label: "Glassmorphism" },
];

interface Props {
  state: BuilderState;
  setState: (s: BuilderState) => void;
  onNext: () => void;
}

const StepCustomize = ({ state, setState, onNext }: Props) => {
  const [generating, setGenerating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const toggleFeature = (f: string) => {
    const next = state.features.includes(f)
      ? state.features.filter((x) => x !== f)
      : [...state.features, f];
    setState({ ...state, features: next });
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setState({ ...state, generated: true });
    }, 2500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Panel */}
      <div className="lg:w-[40%] space-y-8">
        {/* Portfolio Type */}
        <div>
          <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-3 block">
            What are you building this for?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {portfolioTypes.map((t) => {
              const selected = state.portfolioType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setState({ ...state, portfolioType: t.key })}
                  className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
                    selected
                      ? "border-accent-violet bg-accent-violet/10 text-foreground"
                      : "border-border bg-surface text-text-secondary hover:border-[hsl(var(--border-hover))]"
                  }`}
                >
                  <t.icon className={`w-5 h-5 ${selected ? "text-accent-violet" : ""}`} />
                  <span className="font-dm text-sm font-medium">{t.label}</span>
                  {selected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-pink" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-3 block">
            What sections do you want?
          </label>
          <div className="flex flex-wrap gap-2">
            {allFeatures.map((f) => {
              const active = state.features.includes(f);
              return (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFeature(f)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-dm border transition-all duration-200 ${
                    active
                      ? "bg-accent-violet/20 border-accent-violet/40 text-foreground"
                      : "bg-elevated border-border text-text-secondary hover:border-[hsl(var(--border-hover))]"
                  }`}
                >
                  {active ? "✓ " : ""}{f}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-3 block">
            Pick a visual style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((t) => {
              const selected = state.theme === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setState({ ...state, theme: t.key })}
                  className={`relative h-20 rounded-xl border flex items-center justify-center font-dm text-sm transition-all duration-200 ${
                    selected
                      ? "border-accent-violet bg-accent-violet/10 text-foreground"
                      : "border-border bg-surface text-text-secondary hover:border-[hsl(var(--border-hover))]"
                  }`}
                >
                  {t.label}
                  {selected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-pink" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Prompt */}
        <div>
          <label className="font-dm text-xs text-text-secondary uppercase tracking-widest mb-3 block">
            Tell the AI anything extra
          </label>
          <textarea
            placeholder="e.g. I'm a backend engineer who loves distributed systems. Make me sound senior but not arrogant."
            value={state.aiPrompt}
            onChange={(e) => setState({ ...state, aiPrompt: e.target.value })}
            className="w-full bg-elevated border border-border rounded-xl p-4 font-dm text-sm text-foreground placeholder:text-text-tertiary outline-none focus:border-[hsl(var(--border-active))] transition-all resize-none h-24"
          />
          <p className="text-accent-pink text-xs font-dm mt-1.5">
            Optional but makes your bio 10x better
          </p>
        </div>

        {/* Generate */}
        {!state.generated ? (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full btn-gradient text-primary-foreground font-syne font-semibold py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden"
          >
            {generating ? (
              <span className="animate-pulse">AI is writing your story...</span>
            ) : (
              "Generate Portfolio ✦"
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full btn-gradient text-primary-foreground font-syne font-semibold py-3.5 rounded-xl hover:scale-[1.02] transition-transform"
          >
            See preview →
          </button>
        )}
      </div>

      {/* Right Panel - Preview */}
      <div className="lg:w-[60%]">
        <div className="flex items-center gap-2 mb-3 justify-end">
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={`p-2 rounded-lg transition-colors ${
              previewDevice === "desktop" ? "bg-elevated text-foreground" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={`p-2 rounded-lg transition-colors ${
              previewDevice === "mobile" ? "bg-elevated text-foreground" : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-[0_0_40px_hsl(263,84%,58%,0.08)] overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 ml-4">
              <div className="bg-elevated rounded-md px-3 py-1 text-xs font-mono text-text-tertiary max-w-xs">
                devfolio.sh/preview
              </div>
            </div>
          </div>

          {/* Preview content */}
          <div
            className={`mx-auto transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-[390px]" : "w-full"
            }`}
          >
            <div className="p-8 min-h-[500px]">
              {state.generated ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent-violet/20 flex items-center justify-center">
                      <span className="font-syne text-2xl font-bold text-accent-violet">
                        {(state.profiles.github || "U")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-syne text-xl font-bold text-foreground">
                        @{state.profiles.github || "username"}
                      </h3>
                      <p className="font-dm text-sm text-text-secondary">
                        Full-stack developer · Open source enthusiast
                      </p>
                    </div>
                  </div>

                  {state.features.includes("Stats") && (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Repos", value: "42" },
                        { label: "Contributions", value: "1,247" },
                        { label: "Stars", value: "186" },
                      ].map((s) => (
                        <div key={s.label} className="bg-elevated rounded-xl p-4 text-center">
                          <div className="font-syne text-2xl font-bold text-foreground">{s.value}</div>
                          <div className="font-dm text-xs text-text-secondary mt-1">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {state.features.includes("Skills") && (
                    <div>
                      <h4 className="font-syne text-sm font-bold text-foreground mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {["TypeScript", "React", "Node.js", "Python", "Go", "PostgreSQL"].map((s) => (
                          <span key={s} className="px-3 py-1 rounded-lg bg-accent-violet/10 border border-accent-violet/20 text-xs font-mono text-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {state.features.includes("Projects") && (
                    <div>
                      <h4 className="font-syne text-sm font-bold text-foreground mb-3">Projects</h4>
                      <div className="space-y-3">
                        {["cloud-sync", "ml-pipeline", "chat-app"].map((p) => (
                          <div key={p} className="bg-elevated rounded-xl p-4 border border-border">
                            <div className="font-mono text-sm text-foreground font-medium">{p}</div>
                            <div className="font-dm text-xs text-text-secondary mt-1">
                              A sample project description with useful details.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="font-dm text-text-tertiary text-sm">
                    Generate your portfolio to see a preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepCustomize;
