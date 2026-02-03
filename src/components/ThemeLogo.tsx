import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import logoDark from '@/assets/logo-brighter-dark.png';
import logoLight from '@/assets/logo-brighter-light.png';

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

export function ThemeLogo({ className = "h-8", alt = "Brighter Risk Pro" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <img src={logoDark} alt={alt} className={className} />;
  }

  // Usa logo diferente baseado no tema
  const logoSrc = resolvedTheme === 'light' ? logoLight : logoDark;

  return (
    <img 
      src={logoSrc}
      alt={alt}
      className={`${className} transition-all duration-200`}
    />
  );
}
