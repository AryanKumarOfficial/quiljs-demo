"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "../../lib/utils";

interface MotionDivProps extends Omit<React.ComponentProps<typeof motion.div>, 'variants'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale";
  once?: boolean;
}

export const MotionDiv = ({
  children,
  delay = 0,
  duration = 0.5,
  animation = "fadeIn",
  once = true,
  className,
  ...props
}: MotionDivProps) => {
  // Animation variants
  const variants: Record<string, Variants> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={variants[animation]}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};