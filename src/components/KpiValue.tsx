import { useEffect, useRef, useState } from "react";
import { formatNumberBR } from "@/lib/formatting";
import { cn } from "@/lib/utils";

interface KpiValueProps {
  value: number;
  unit?: string;
  prefix?: string;
  variant?: "default" | "success" | "danger" | "primary";
  animated?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: boolean;
  decimals?: number;
  className?: string;
  showSign?: boolean;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function KpiValue({
  value,
  unit,
  prefix,
  variant = "default",
  animated = false,
  size = "lg",
  gradient = false,
  decimals = 0,
  className,
  showSign = false,
}: KpiValueProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const from = prevValueRef.current;
    const to = value;
    prevValueRef.current = value;
    const duration = 800;

    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplayValue(from + (to - from) * eased);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [value, animated]);

  const variantClass = {
    default: "",
    success: "kpi-profit",
    danger: "kpi-loss",
    primary: "text-primary",
  }[variant];

  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl lg:text-4xl",
    xl: "text-4xl lg:text-5xl",
  }[size];

  const formatted = formatNumberBR(displayValue, decimals);
  const sign = showSign && value > 0 ? "+" : showSign && value < 0 ? "" : "";

  return (
    <span
      className={cn(
        "kpi-number inline-flex items-baseline",
        sizeClass,
        variantClass,
        gradient && "kpi-gradient",
        animated && "animate-count-up",
        className
      )}
    >
      {prefix && <span className="kpi-unit">{prefix}</span>}
      <span>{sign}{formatted}</span>
      {unit && <span className="kpi-unit">{unit}</span>}
    </span>
  );
}
