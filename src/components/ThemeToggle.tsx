import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-250
        bg-secondary/60 backdrop-blur-sm border border-border hover:border-primary/30
        dark:bg-secondary/40 dark:backdrop-blur-md
        hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
      aria-label="Alternar tema"
    >
      <Sun className="h-3.5 w-3.5 text-primary rotate-0 scale-100 transition-transform duration-250 dark:-rotate-90 dark:scale-0" />
      <Moon className="h-3.5 w-3.5 text-primary absolute left-3 rotate-90 scale-0 transition-transform duration-250 dark:rotate-0 dark:scale-100" />
      <span className="text-xs font-medium text-muted-foreground ml-3">
        {isDark ? 'Escuro' : 'Claro'}
      </span>
    </button>
  );
}
