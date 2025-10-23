import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type PeriodType = "7d" | "15d" | "30d" | "month" | "custom";

interface PeriodFilterProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomDateChange?: (start: Date | undefined, end: Date | undefined) => void;
}

export function PeriodFilter({
  selectedPeriod,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}: PeriodFilterProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(customStartDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(customEndDate);

  const periods = [
    { value: "7d" as PeriodType, label: "7 dias" },
    { value: "15d" as PeriodType, label: "15 dias" },
    { value: "30d" as PeriodType, label: "30 dias" },
    { value: "month" as PeriodType, label: "Mês atual" },
  ];

  const handleApplyCustomDates = () => {
    if (tempStartDate && tempEndDate && onCustomDateChange) {
      onCustomDateChange(tempStartDate, tempEndDate);
      onPeriodChange("custom");
      setShowCustomPicker(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
      
      <Popover open={showCustomPicker} onOpenChange={setShowCustomPicker}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedPeriod === "custom" ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {selectedPeriod === "custom" && customStartDate && customEndDate
              ? `${format(customStartDate, "dd/MM")} - ${format(customEndDate, "dd/MM")}`
              : "Customizado"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Início</label>
              <Calendar
                mode="single"
                selected={tempStartDate}
                onSelect={setTempStartDate}
                locale={ptBR}
                className={cn("pointer-events-auto")}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Fim</label>
              <Calendar
                mode="single"
                selected={tempEndDate}
                onSelect={setTempEndDate}
                locale={ptBR}
                disabled={(date) => tempStartDate ? date < tempStartDate : false}
                className={cn("pointer-events-auto")}
              />
            </div>
            <Button
              onClick={handleApplyCustomDates}
              disabled={!tempStartDate || !tempEndDate}
              className="w-full"
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
