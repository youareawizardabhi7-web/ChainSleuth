"use client";

/**
 * AnimatedStepper Component for ChainSleuth Synapse Design System
 * Production-grade multi-step indicator with fluid Framer Motion transitions and dynamic height adjustment.
 */

import React, {
  useState,
  Children,
  useRef,
  useLayoutEffect,
  HTMLAttributes,
  ReactNode,
} from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Check } from "lucide-react";

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
}

export function AnimatedStepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div
      className={`flex w-full flex-col items-center justify-center ${rest.className || ""}`}
      {...rest}
    >
      <div
        className={`w-full overflow-hidden rounded-[2.5rem] bg-[#080808]/90 border border-white/10 backdrop-blur-2xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] ${stepCircleContainerClassName}`}
      >
        {/* Step Indicators Header */}
        <div
          className={`flex w-full items-center p-6 sm:p-8 pb-4 border-b border-white/5 ${stepContainerClassName}`}
        >
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dynamic Height Animated Content Area */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`space-y-4 px-6 sm:px-8 py-6 ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Footer Navigation Actions */}
        {!isCompleted && (
          <div
            className={`px-6 sm:px-8 pb-8 pt-4 border-t border-white/5 bg-black/30 ${footerClassName}`}
          >
            <div
              className={`flex items-center ${
                currentStep !== 1 ? "justify-between" : "justify-end"
              }`}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs sm:text-sm font-mono text-neutral-400 transition-colors duration-200 hover:text-white px-4 py-2"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 px-8 text-xs sm:text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:opacity-95 hover:shadow-[0_0_20px_-3px_rgba(139,92,246,0.6)] active:scale-95"
                {...nextButtonProps}
              >
                {isLastStep ? "Launch Full Investigation" : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Step Content Wrapper with dynamic height and spring slide animation
 */
function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = "",
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight || "auto" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? 24 : -24,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? -24 : 24,
    opacity: 0,
  }),
};

/**
 * Step Sub-component for individual step content
 */
export function Step({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="py-2">
      {title && (
        <div className="mb-5">
          <h2 className="font-instrument text-2xl sm:text-3xl font-normal tracking-tight text-white mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs font-mono text-neutral-400">{subtitle}</p>
          )}
        </div>
      )}
      <div className="text-neutral-300 leading-relaxed text-sm">{children}</div>
    </div>
  );
}

/**
 * Step Indicator Circle with Synapse High-Tech Glows
 */
function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators = false,
}: {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
}) {
  const status =
    currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  return (
    <motion.div
      onClick={() => !disableStepIndicators && onClickStep(step)}
      className={`relative flex items-center justify-center ${
        !disableStepIndicators ? "cursor-pointer" : ""
      }`}
      animate={status}
    >
      <motion.div
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: "#121212",
            color: "#737373",
            borderColor: "rgba(255, 255, 255, 0.1)",
          },
          active: {
            scale: 1,
            backgroundColor: "#030303",
            color: "#ffffff",
            borderColor: "#8b5cf6",
          },
          complete: {
            scale: 1,
            backgroundColor: "#8b5cf6",
            color: "#ffffff",
            borderColor: "#8b5cf6",
          },
        }}
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-colors duration-300 shadow-sm"
      >
        {status === "complete" ? (
          <Check className="h-5 w-5 text-white" />
        ) : (
          <span>{step}</span>
        )}
      </motion.div>

      {status === "active" && (
        <motion.div
          layoutId="active-glow"
          className="absolute -inset-1.5 rounded-full bg-violet-500/30 blur-md pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

/**
 * Connector line between step indicators with animated progress
 */
function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative mx-3 sm:mx-4 h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isComplete ? 1 : 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      />
    </div>
  );
}

export default AnimatedStepper;

