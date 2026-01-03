import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { t } = useLanguage();

  const steps = [
    { key: 'step1', label: t('step1') },
    { key: 'step2', label: t('step2') },
    { key: 'step3', label: t('step3') },
    { key: 'step4', label: t('step4') },
  ];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'step-indicator',
                  isActive && 'step-indicator-active',
                  isComplete && 'step-indicator-complete',
                  !isActive && !isComplete && 'step-indicator-pending'
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1.5 font-medium',
                  isActive && 'text-primary',
                  isComplete && 'text-success',
                  !isActive && !isComplete && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 md:w-16 h-0.5 mx-2 rounded-full transition-colors',
                  stepNumber < currentStep ? 'bg-success' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
