"use client";

import { motion } from "framer-motion";
import { GradientButton } from "./gradient-button";
import { MotionDiv } from "./motion-div";

interface HeroProps {
  title: string;
  subtitle: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  backgroundPattern?: "dots" | "grid" | "waves" | "none";
  illustration?: React.ReactNode;
}

export function Hero({
  title,
  subtitle,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  backgroundPattern = "dots",
  illustration,
}: HeroProps) {
  return (
    <div className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Background Pattern */}
      {backgroundPattern !== "none" && (
        <div className="absolute inset-0 -z-10 opacity-10">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            fill="none"
          >
            {backgroundPattern === "dots" && (
              <pattern
                id="dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            )}
            {backgroundPattern === "grid" && (
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 20h40M20 0v40"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            )}
            {backgroundPattern === "waves" && (
              <pattern
                id="waves"
                width="100"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 10C20 20, 40 0, 60 10C80 20, 100 0, 120 10"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  fill="none"
                />
              </pattern>
            )}
            <rect
              width="100%"
              height="100%"
              fill={`url(#${backgroundPattern})`}
            />
          </svg>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <MotionDiv
              animation="slideRight"
              className="lg:pr-8"
              delay={0.1}
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                {title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl">
                {subtitle}
              </p>

              {(primaryActionLabel || secondaryActionLabel) && (
                <div className="mt-10 flex items-center gap-x-6">
                  {primaryActionLabel && (
                    <GradientButton
                      onClick={onPrimaryAction}
                      size="lg"
                      className="text-base font-semibold"
                    >
                      {primaryActionLabel}
                    </GradientButton>
                  )}
                  {secondaryActionLabel && (
                    <GradientButton
                      onClick={onSecondaryAction}
                      variant="ghost"
                      size="lg"
                      className="text-base font-semibold"
                    >
                      {secondaryActionLabel}
                    </GradientButton>
                  )}
                </div>
              )}
            </MotionDiv>
          </div>

          {illustration && (
            <MotionDiv 
              animation="slideLeft" 
              className="lg:w-1/2 mt-10 lg:mt-0"
              delay={0.3}
            >
              {illustration}
            </MotionDiv>
          )}
        </div>
      </div>
    </div>
  );
}