import React from "react";
import { cn } from "@/lib/utils"; // Assumes standard shadcn/tailwind utility

interface CircularProgressProps {
  progress: number; // 0 to 100
  strokeWidth?: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CircularProgressButton = ({
  progress,
  strokeWidth = 4,
  className,
  children,
  onClick,
  disabled = false,
}: CircularProgressProps) => {
  const radius = 48; // Percentage of the SVG viewbox
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn("relative flex items-center justify-center aspect-square", className)}
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90 p-[2px]" viewBox="0 0 100 100">
        {/* Background Circle (Track) */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted-foreground/10"
        />
        {/* Progress Circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-green-600 transition-all duration-500 ease-out"
        />
      </svg>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">{children}</div>
    </button>
  );
};
