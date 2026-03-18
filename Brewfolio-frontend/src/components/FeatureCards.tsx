import { motion } from "framer-motion";
import { GitBranch, Sparkles, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: GitBranch,
    title: "Scrape everything",
    description: "Connect your profiles once. We pull your stats, projects, and contributions automatically.",
  },
  {
    icon: Sparkles,
    title: "AI writes for you",
    description: "Claude reads your repos and competition history. Writes a bio that doesn't sound like ChatGPT wrote it.",
  },
  {
    icon: ArrowUpRight,
    title: "Publish in one click",
    description: "Get a live URL at devfolio.sh/yourname. Export as static HTML or drop the resume PDF.",
  },
];

const FeatureCards = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="group bg-surface border border-border rounded-2xl p-8 hover:border-[hsl(var(--border-hover))] hover:scale-[1.015] transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center mb-6">
              <feature.icon className="w-6 h-6 text-accent-violet" />
            </div>
            <h3 className="font-syne text-xl font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="font-dm text-text-secondary text-sm leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
