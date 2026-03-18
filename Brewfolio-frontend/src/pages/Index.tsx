import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Typewriter from "@/components/Typewriter";
import SocialMarquee from "@/components/SocialMarquee";
import FeatureCards from "@/components/FeatureCards";

const Index = () => {
  return (
    <div className="min-h-screen bg-void">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-syne font-extrabold text-4xl sm:text-5xl md:text-7xl leading-tight tracking-tight"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
        >
          Build your dev{" "}
          <span className="gradient-text">identity</span>.
          <br />
          Not just a portfolio.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-dm text-text-secondary text-lg mt-6 max-w-2xl mx-auto"
        >
          Pull from GitHub, LeetCode, Codeforces, and more. AI writes the copy. You own the result.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center mt-6"
        >
          <Typewriter />

          <Link to="/build" className="mt-8">
            <button className="btn-gradient text-primary-foreground font-syne font-semibold text-base px-8 py-3.5 rounded-xl hover:scale-[1.03] transition-transform duration-200">
              Start Building →
            </button>
          </Link>

          <p className="text-text-tertiary text-xs font-dm mt-3">
            No account needed to preview
          </p>
        </motion.div>
      </section>

      <SocialMarquee />
      <FeatureCards />
    </div>
  );
};

export default Index;
