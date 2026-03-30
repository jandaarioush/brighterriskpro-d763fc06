import { useLocalClock } from "@/hooks/useLocalClock";
import { getGreeting, firstNameFrom, formatDateTimePtBR } from "@/lib/formatting";

type Props = {
  user: { name?: string; email?: string } | null;
  monthlyGoal?: number;
  accumulatedResult?: number;
  dailyGoalPoints?: number;
};

export default function GreetingBanner({ user, monthlyGoal, accumulatedResult, dailyGoalPoints }: Props) {
  const now = useLocalClock(30_000);
  const greeting = getGreeting(now);
  const firstName = firstNameFrom(user);
  const subtitle = formatDateTimePtBR(now);

  const goalProgress = monthlyGoal && monthlyGoal > 0
    ? Math.min(((accumulatedResult || 0) / monthlyGoal) * 100, 100)
    : null;

  const goalRemaining = monthlyGoal && monthlyGoal > 0
    ? Math.max(0, monthlyGoal - (accumulatedResult || 0))
    : null;

  // Insight automático
  const getInsight = () => {
    if (!goalProgress) return null;
    if (goalProgress >= 95) return { text: "Meta praticamente batida! 🎯", color: "text-success" };
    if (goalProgress >= 60) return { text: "Acima da média do mês 📈", color: "text-success" };
    if (goalProgress >= 30) return { text: "Ritmo constante, continue assim 💪", color: "text-primary" };
    return { text: "Precisa acelerar o ritmo ⚡", color: "text-primary" };
  };

  const insight = getInsight();

  return (
    <section
      className="w-full rounded-lg card-glow p-6 mb-6"
      aria-label="Painel de Controle"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Painel de Controle
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
            {greeting}{firstName && `, ${firstName}`} <span aria-hidden>👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {dailyGoalPoints && dailyGoalPoints > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Meta diária</p>
            <p className="text-xl font-bold font-mono-trading text-primary">
              {dailyGoalPoints.toFixed(0)} pts
            </p>
          </div>
        )}
      </div>

      {goalProgress !== null && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              Progresso da meta: <span className="font-mono-trading font-medium text-foreground">{goalProgress.toFixed(1)}%</span>
            </span>
            {goalRemaining !== null && (
              <span className="text-muted-foreground">
                Falta <span className="font-mono-trading font-medium text-primary">R$ {goalRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary progress-glow transition-all duration-700"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          {insight && (
            <p className={`text-xs font-medium ${insight.color}`}>{insight.text}</p>
          )}
        </div>
      )}
    </section>
  );
}
