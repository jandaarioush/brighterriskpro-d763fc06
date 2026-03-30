import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "danger" | "warning";
  trend?: {
    value: string;
    isPositive: boolean;
  };
  sparklineData?: number[];
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  sparklineData,
}: StatCardProps) {
  const glowClass = {
    default: "card-glow",
    success: "card-glow card-glow-success",
    danger: "card-glow card-glow-danger",
    warning: "card-glow card-glow-primary",
  }[variant];

  const trendColor = {
    default: "text-primary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-primary",
  }[variant];

  const sparkColor = {
    default: "hsl(43 85% 52%)",
    success: "hsl(152 82% 45%)",
    danger: "hsl(0 84% 60%)",
    warning: "hsl(43 85% 52%)",
  }[variant];

  return (
    <Card className={`p-6 ${glowClass} relative overflow-hidden group`}>
      {/* Icon — top-right, subtle */}
      <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-60 transition-opacity">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>

        <p className="text-3xl lg:text-4xl font-bold font-mono-trading tracking-tight animate-count-up">
          {value}
        </p>

        {sparklineData && sparklineData.length > 1 && (
          <MiniSparkline data={sparklineData} color={sparkColor} />
        )}

        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}

        {trend && (
          <p className={`text-sm font-medium font-mono-trading ${trend.isPositive ? "text-success" : "text-danger"}`}>
            {trend.isPositive ? "▲" : "▼"} {trend.value}
          </p>
        )}
      </div>
    </Card>
  );
}
