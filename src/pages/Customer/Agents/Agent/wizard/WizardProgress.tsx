interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    label: string;
  }>;
}

const WizardProgress = ({ currentStep, totalSteps, steps }: WizardProgressProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-1">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-muted">
          {/* Progress fill */}
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 z-10
                    ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-1.5 text-[11px] font-medium text-center
                    ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WizardProgress;
