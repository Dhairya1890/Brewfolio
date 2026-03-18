import { useState } from "react";
import { Github, Code2, Trophy, Terminal, BookOpen, Hash, Check } from "lucide-react";
import type { BuilderState } from "@/pages/Build";

const platforms = [
  { key: "github", name: "GitHub", icon: Github },
  { key: "leetcode", name: "LeetCode", icon: Code2 },
  { key: "codeforces", name: "Codeforces", icon: Trophy },
  { key: "atcoder", name: "AtCoder", icon: Terminal },
  { key: "codechef", name: "CodeChef", icon: Hash },
  { key: "devto", name: "Dev.to / Hashnode", icon: BookOpen },
];

interface Props {
  state: BuilderState;
  setState: (s: BuilderState) => void;
  onNext: () => void;
}

const StepConnect = ({ state, setState, onNext }: Props) => {
  const [focused, setFocused] = useState<string | null>(null);

  const hasAny = Object.values(state.profiles).some((v) => v.trim().length > 0);

  const updateProfile = (key: string, value: string) => {
    setState({ ...state, profiles: { ...state.profiles, [key]: value } });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-syne font-bold text-3xl text-foreground mb-2">
        Where do you live online?
      </h2>
      <p className="font-dm text-text-secondary mb-8">
        Add your coding profiles. Skip the ones you don't use.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {platforms.map((p) => {
          const value = state.profiles[p.key] || "";
          const isFilled = value.trim().length > 0;
          const isFocused = focused === p.key;

          return (
            <div
              key={p.key}
              className={`flex items-center gap-4 bg-surface border rounded-xl p-4 transition-all duration-200 ${
                isFocused
                  ? "border-[hsl(var(--border-active))] shadow-[0_0_12px_hsl(189,94%,43%,0.15)]"
                  : isFilled
                  ? "border-accent-cyan/30"
                  : "border-border opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <p.icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isFilled ? "text-foreground" : "text-text-secondary"
                  }`}
                />
                <div className="flex flex-col flex-1">
                  <span className="font-dm text-xs text-text-secondary mb-1">{p.name}</span>
                  <input
                    type="text"
                    placeholder="username"
                    value={value}
                    onChange={(e) => updateProfile(p.key, e.target.value)}
                    onFocus={() => setFocused(p.key)}
                    onBlur={() => setFocused(null)}
                    className="bg-transparent font-mono text-sm text-foreground placeholder:text-text-tertiary outline-none w-full"
                  />
                </div>
              </div>
              {isFilled && (
                <div className="w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-accent-cyan" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <label className="font-dm text-sm text-text-secondary mb-2 block">
          Anything else?
        </label>
        <textarea
          placeholder="Paste a link to anything else — personal blog, Notion page, Dribbble, LinkedIn..."
          value={state.extraLinks}
          onChange={(e) => setState({ ...state, extraLinks: e.target.value })}
          className="w-full bg-elevated border border-border rounded-xl p-4 font-mono text-sm text-foreground placeholder:text-text-tertiary outline-none focus:border-[hsl(var(--border-active))] focus:shadow-[0_0_12px_hsl(189,94%,43%,0.15)] transition-all resize-none h-24"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!hasAny}
        className={`btn-gradient text-primary-foreground font-syne font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 ${
          hasAny ? "hover:scale-[1.03]" : "opacity-40 cursor-not-allowed"
        }`}
      >
        Build my profile →
      </button>
    </div>
  );
};

export default StepConnect;
