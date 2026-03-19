import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import StepIndicator from "@/components/builder/StepIndicator";
import StepConnect from "@/components/builder/StepConnect";
import StepCustomize from "@/components/builder/StepCustomize";
import StepPreview from "@/components/builder/StepPreview";
import type {
  PlatformInputs,
  ThemeType,
  AccentColor,
  SectionsVisible,
  DeveloperProfile,
  PortfolioType,
} from "@/types";

export interface BuilderState {
  profiles: Record<string, string>;
  extraLinks: string;
  portfolioType: string;
  features: string[];
  theme: string;
  aiPrompt: string;
  generated: boolean;
  name: string;
  accentColor: string;
  fontSize: string;
  // Real API state
  jobId?: string;
  profile?: DeveloperProfile;
  scrapeError?: string;
}

const initialState: BuilderState = {
  profiles: {},
  extraLinks: "",
  portfolioType: "job",
  features: ["Projects", "Skills", "Stats", "GitHub Activity", "Resume / CV"],
  theme: "minimal",
  aiPrompt: "",
  generated: false,
  name: "",
  accentColor: "violet",
  fontSize: "medium",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const BuildPage = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<BuilderState>(initialState);

  const goTo = (s: number) => {
    setDirection(s > step ? 1 : -1);
    setStep(s);
  };

  return (
    <div className="min-h-screen bg-void">
      <Navbar />
      <div className="pt-20 px-6 max-w-7xl mx-auto">
        <StepIndicator current={step} onStepClick={goTo} />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {step === 1 && (
              <StepConnect state={state} setState={setState} onNext={() => goTo(2)} />
            )}
            {step === 2 && (
              <StepCustomize state={state} setState={setState} onNext={() => goTo(3)} />
            )}
            {step === 3 && (
              <StepPreview state={state} setState={setState} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuildPage;
