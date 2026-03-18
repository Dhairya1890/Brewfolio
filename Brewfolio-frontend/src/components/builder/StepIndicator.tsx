import { Check } from "lucide-react";

interface StepIndicatorProps {
  current: number;
  onStepClick: (step: number) => void;
}

const steps = [
  { num: 1, label: "Connect" },
  { num: 2, label: "Customize" },
  { num: 3, label: "Preview" },
];

const StepIndicator = ({ current, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((s, i) => {
        const isComplete = current > s.num;
        const isCurrent = current === s.num;

        return (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => onStepClick(s.num)}
              className="flex items-center gap-2 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                  isComplete
                    ? "bg-accent-cyan text-background"
                    : isCurrent
                    ? "bg-accent-violet text-primary-foreground ring-4 ring-accent-violet/30"
                    : "bg-elevated text-text-tertiary"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : `0${s.num}`}
              </div>
              <span
                className={`font-dm text-sm transition-colors ${
                  isCurrent ? "text-foreground" : "text-text-secondary"
                }`}
              >
                {s.label}
              </span>
            </button>

            {i < steps.length - 1 && (
              <div className="w-20 h-0.5 mx-4 bg-elevated relative overflow-hidden rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-accent-violet progress-fill rounded-full"
                  style={{ width: current > s.num ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
