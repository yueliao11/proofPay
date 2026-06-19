"use client";

import { cn } from "@/lib/utils";

export function ReviewScore({
  score,
  threshold = 80,
  size = "lg",
}: {
  score: number;
  threshold?: number;
  size?: "sm" | "md" | "lg";
}) {
  const passed = score >= threshold;
  const color = passed ? "text-[#22C55E]" : score >= threshold - 20 ? "text-[#F59E0B]" : "text-[#EF4444]";
  const ringColor = passed ? "stroke-[#22C55E]" : score >= threshold - 20 ? "stroke-[#F59E0B]" : "stroke-[#EF4444]";

  const sizeClasses = {
    sm: "size-16 text-xl",
    md: "size-24 text-3xl",
    lg: "size-32 text-4xl",
  };

  const strokeWidth = size === "sm" ? 4 : 6;
  const radius = size === "sm" ? 26 : size === "md" ? 42 : 58;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
      <svg className="absolute inset-0 size-full -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          stroke="#263244"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          fill="none"
          className={cn("transition-all duration-700", ringColor)}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="z-10 flex flex-col items-center">
        <span className={cn("font-bold", color)}>{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-[#94A3B8]">
          {passed ? "Pass" : "Fail"}
        </span>
      </div>
    </div>
  );
}
