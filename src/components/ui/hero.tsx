"use client";

import React from "react";
import { motion } from "framer-motion";
import { GradientButton } from "./gradient-button";
import { MotionDiv } from "./motion-div";

interface HeroProps {
  title: string | React.ReactNode;
  subtitle: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
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
  primaryAction,
  secondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  backgroundPattern = "dots",
  illustration,
}: HeroProps) {
  const showPattern = backgroundPattern !== "none";

  return (
    <div className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {showPattern && (
        <div className="absolute inset-0 -z-10 opacity-10">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              {backgroundPattern === "dots" && (
                <pattern
                  id="pattern-dots"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
              )}
              {backgroundPattern === "grid" && (
                <pattern
                  id="pattern-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 20h40M20 0v40"
                    stroke="currentColor"
                    strokeWidth={0.5}
                  />
                </pattern>
              )}
              {backgroundPattern === "waves" && (
                <pattern
                  id="pattern-waves"
                  width="100"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 10 C20 20, 40 0, 60 10 C80 20, 100 0, 120 10"
                    stroke="currentColor"
                    strokeWidth={0.5}
                    fill="none"
                  />
                </pattern>
              )}
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={`url(#pattern-${backgroundPattern})`}
            />
          </svg>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <MotionDiv animation="slideRight" className="lg:pr-8" delay={0.1}>
              {/* Handle title as string or custom React node */}
              {typeof title === "string" ? (
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  {title}
                </h1>
              ) : (
                title
              )}

              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl">
                {subtitle}
              </p>

              <div className="mt-10 flex items-center gap-x-6">
                {primaryAction && (
                  <div>{primaryAction}</div>
                )}
                {!primaryAction && primaryActionLabel && (
                  <GradientButton
                    onClick={onPrimaryAction}
                    size="lg"
                    className="text-base font-semibold"
                  >
                    {primaryActionLabel}
                  </GradientButton>
                )}
                
                {secondaryAction && (
                  <div>{secondaryAction}</div>
                )}
                {!secondaryAction && secondaryActionLabel && (
                  <GradientButton
                    variant="ghost"
                    onClick={onSecondaryAction}
                    size="lg"
                    className="text-base font-semibold"
                  >
                    {secondaryActionLabel}
                  </GradientButton>
                )}
              </div>
            </MotionDiv>
          </div>

          {illustration && (
            <MotionDiv animation="slideLeft" className="lg:w-1/2 mt-10 lg:mt-0" delay={0.3}>
              {illustration}
            </MotionDiv>
          )}
        </div>
      </div>
    </div>
  );
}
