import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import logoBrighter from '@/assets/logo-brighter.png';

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

export function ThemeLogo({ className = "h-8", alt = "Brighter" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <img src={logoBrighter} alt={alt} className={className} />;
  }

  // Usando filtro CSS para modo claro (inverte o logo)
  return (
    <img 
      src={logoBrighter}
      alt={alt}
      className={`${className} transition-all duration-200 ${
        resolvedTheme === 'light' 
          ? 'brightness-0' // Torna preto para fundo claro
          : ''
      }`}
    />
  );
}
