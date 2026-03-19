import { useState } from "react";
import { Github, Code2, Trophy, Terminal, BookOpen, Hash, Check, Loader2 } from "lucide-react";
import type { BuilderState } from "@/pages/Build";
import { scraper } from "@/lib/api";
import { toast } from "sonner";

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
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const hasAny = Object.values(state.profiles).some((v) => v.trim().length > 0);

  const updateProfile = (key: string, value: string) => {
    setState({ ...state, profiles: { ...state.profiles, [key]: value } });
  };

  const handleBuild = async () => {
    setLoading(true);
    setStatusMessage("Initializing...");

    try {
      // Map frontend platform keys to API PlatformInputs
      const platformInputs = {
        github: state.profiles.github?.trim() || undefined,
        leetcode: state.profiles.leetcode?.trim() || undefined,
        codeforces: state.profiles.codeforces?.trim() || undefined,
        atcoder: state.profiles.atcoder?.trim() || undefined,
        codechef: state.profiles.codechef?.trim() || undefined,
        extra_url: state.extraLinks?.trim() || undefined,
      };

      const { job_id } = await scraper.initJob(platformInputs);
      setState({ ...state, jobId: job_id });

      // Poll until done
      await scraper.pollUntilDone(
        job_id,
        (status) => {
          setStatusMessage(status.message || "Processing...");
        },
        2000,
      );

      setStatusMessage("Data collected! Moving on...");
      setState({ ...state, jobId: job_id });
      toast.success("Profiles scraped successfully!");

      // Small delay for the success toast to show
      setTimeout(() => {
        onNext();
      }, 500);
    } catch (error: any) {
      const msg = error?.message || "Failed to scrape profiles";
      setStatusMessage("");
      toast.error(msg);
      setState({ ...state, scrapeError: msg });
    } finally {
      setLoading(false);
    }
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
                    disabled={loading}
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
          disabled={loading}
          className="w-full bg-elevated border border-border rounded-xl p-4 font-mono text-sm text-foreground placeholder:text-text-tertiary outline-none focus:border-[hsl(var(--border-active))] focus:shadow-[0_0_12px_hsl(189,94%,43%,0.15)] transition-all resize-none h-24"
        />
      </div>

      {/* Status message during scraping */}
      {loading && statusMessage && (
        <div className="mb-4 flex items-center gap-2 font-dm text-sm text-accent-cyan">
          <Loader2 className="w-4 h-4 animate-spin" />
          {statusMessage}
        </div>
      )}

      <button
        onClick={handleBuild}
        disabled={!hasAny || loading}
        className={`btn-gradient text-primary-foreground font-syne font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 ${
          hasAny && !loading ? "hover:scale-[1.03]" : "opacity-40 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Scraping profiles...
          </span>
        ) : (
          "Build my profile →"
        )}
      </button>
    </div>
  );
};

export default StepConnect;
