import { useLocalClock } from "@/hooks/useLocalClock";
import { getGreeting, firstNameFrom, formatDateTimePtBR } from "@/lib/formatting";

type Props = {
  user: { name?: string; email?: string } | null;
};

export default function GreetingBanner({ user }: Props) {
  const now = useLocalClock(30_000); // atualiza a cada 30s
  const greeting = getGreeting(now);
  const firstName = firstNameFrom(user);
  const subtitle = formatDateTimePtBR(now);

  return (
    <section
      className="w-full rounded-lg border bg-card/50 backdrop-blur p-6 mb-6"
      aria-label="Saudação do usuário"
    >
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
        {greeting}{firstName && `, ${firstName}`} <span aria-hidden>👋</span>
      </h1>
      <p className="text-sm md:text-base text-muted-foreground mt-1">{subtitle}</p>
    </section>
  );
}
