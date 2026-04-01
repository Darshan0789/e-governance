import { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
  canProceed?: (step: number) => boolean;
}

export default function StepWizard({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  canProceed = () => true,
}: StepWizardProps) {
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = canProceed(currentStep);

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) onStepChange(currentStep - 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isDone = idx < currentStep;
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold transition-colors ${
                  isDone
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isActive
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                {isDone ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
              <div className="ml-2 flex-1">
                <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-[200px]">
        {steps[currentStep].content}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLastStep ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}
