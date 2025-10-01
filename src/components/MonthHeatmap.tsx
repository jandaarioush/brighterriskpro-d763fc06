import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface DayResult {
  day: number;
  result: number;
  isWeekend?: boolean;
}

export function MonthHeatmap() {
  // Mock data - replace with real data from your state/backend
  const mockData: DayResult[] = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    result: Math.random() * 1000 - 300,
    isWeekend: (i % 7 === 5 || i % 7 === 6)
  }));

  const getColorClass = (result: number, isWeekend?: boolean) => {
    if (isWeekend) return "bg-muted/30";
    if (result > 200) return "bg-success/80 hover:bg-success";
    if (result > 0) return "bg-success/40 hover:bg-success/60";
    if (result < -200) return "bg-danger/80 hover:bg-danger";
    if (result < 0) return "bg-danger/40 hover:bg-danger/60";
    return "bg-muted hover:bg-muted/80";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Consistência Mensal</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {mockData.map((day) => (
          <div
            key={day.day}
            className={`
              aspect-square rounded-md flex items-center justify-center
              text-sm font-medium transition-all cursor-pointer
              ${getColorClass(day.result, day.isWeekend)}
            `}
            title={`Dia ${day.day}: R$ ${day.result.toFixed(2)}`}
          >
            {day.day}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/80" />
          <span>Lucro alto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/40" />
          <span>Lucro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger/40" />
          <span>Perda</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger/80" />
          <span>Perda alta</span>
        </div>
      </div>
    </Card>
  );
}
