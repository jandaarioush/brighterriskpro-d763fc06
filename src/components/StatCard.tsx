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
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  variant = "default",
  trend 
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-success/30 bg-success/5",
    danger: "border-danger/30 bg-danger/5",
    warning: "border-yellow-500/30 bg-yellow-500/5"
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    danger: "text-danger",
    warning: "text-yellow-500"
  };

  return (
    <Card className={`p-6 transition-all hover:shadow-lg ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm font-medium ${trend.isPositive ? "text-success" : "text-danger"}`}>
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-card/50 ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
