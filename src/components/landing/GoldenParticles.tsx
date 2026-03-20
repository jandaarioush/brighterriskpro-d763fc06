import { useEffect, useRef } from "react";

const COLORS = ["#d99516", "#f4b942", "#ffd166"];

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  opacity: number;
  maxOpacity: number;
  minOpacity: number;
  color: string;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  driftX: number;
  driftY: number;
  fadeSpeed: number;
  fadeOffset: number;
  glow: number;
}

function createParticle(w: number, h: number, layer: "small" | "medium" | "highlight"): Particle {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const baseX = Math.random() * w;
  const baseY = Math.random() * h;

  const config = {
    small: { rMin: 0.5, rMax: 1.5, oMin: 0.15, oMax: 0.3, glow: 0 },
    medium: { rMin: 1.5, rMax: 3, oMin: 0.3, oMax: 0.6, glow: 8 },
    highlight: { rMin: 3, rMax: 5, oMin: 0.6, oMax: 0.9, glow: 20 },
  }[layer];

  const minO = config.oMin + Math.random() * (config.oMax - config.oMin) * 0.3;
  const maxO = config.oMin + Math.random() * (config.oMax - config.oMin);

  return {
    x: baseX,
    y: baseY,
    baseX,
    baseY,
    radius: config.rMin + Math.random() * (config.rMax - config.rMin),
    opacity: minO,
    maxOpacity: maxO,
    minOpacity: minO,
    color,
    orbitRadius: 2 + Math.random() * 12,
    orbitAngle: Math.random() * Math.PI * 2,
    orbitSpeed: 0.002 + Math.random() * 0.008,
    driftX: (Math.random() - 0.5) * 0.15,
    driftY: (Math.random() - 0.5) * 0.1,
    fadeSpeed: 0.0005 + Math.random() * 0.002,
    fadeOffset: Math.random() * Math.PI * 2,
    glow: config.glow,
  };
}

export const GoldenParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let animId = 0;
    let scrollBoost = 0;
    let lastScroll = window.scrollY;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const count = w > 768 ? 150 : 80;
      particles = [];
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const layer = r < 0.6 ? "small" : r < 0.9 ? "medium" : "highlight";
        particles.push(createParticle(w, h, layer));
      }
    };

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScroll);
      scrollBoost = Math.min(scrollBoost + delta * 0.03, 4);
      lastScroll = window.scrollY;
    };

    const ro = new ResizeObserver(() => {
      resize();
      initParticles();
    });
    ro.observe(canvas);
    window.addEventListener("scroll", onScroll, { passive: true });

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      scrollBoost *= 0.95;
      const speedMul = 1 + scrollBoost;

      // Center beam (desktop)
      if (w > 768) {
        const beamAlpha = 0.03 + Math.sin(time * 0.0004) * 0.015;
        const grad = ctx.createLinearGradient(w * 0.5 - 60, 0, w * 0.5 + 60, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.5, `rgba(217, 149, 22, ${beamAlpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(w * 0.5 - 60, 0, 120, h);
      }

      for (const p of particles) {
        // Orbital
        p.orbitAngle += p.orbitSpeed * speedMul;
        // Drift
        p.baseX += p.driftX * speedMul;
        p.baseY += p.driftY * speedMul;
        // Wrap
        if (p.baseX < -10) p.baseX = w + 10;
        if (p.baseX > w + 10) p.baseX = -10;
        if (p.baseY < -10) p.baseY = h + 10;
        if (p.baseY > h + 10) p.baseY = -10;

        p.x = p.baseX + Math.cos(p.orbitAngle) * p.orbitRadius;
        p.y = p.baseY + Math.sin(p.orbitAngle) * p.orbitRadius;

        // Fade pulsante
        const fadeRange = p.maxOpacity - p.minOpacity;
        p.opacity = p.minOpacity + (Math.sin(time * p.fadeSpeed + p.fadeOffset) * 0.5 + 0.5) * fadeRange;

        // Draw
        if (p.glow > 0) {
          ctx.shadowBlur = p.glow;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
