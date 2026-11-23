"use client";

import { useEffect, useRef, useState } from "react";

export type Stat = { label: string; value: number; plain?: boolean };

function Counter({ value, plain }: { value: number; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value); // JS bo'lmasa ham to'g'ri raqam ko'rinadi

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref}>{plain ? n : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}</span>;
}

export function Stats({ items }: { items: Stat[] }) {
  if (items.length === 0) return null; // raqam kiritilmagan bo'lsa blok ko'rsatilmaydi
  return (
    <dl className={`grid grid-cols-2 gap-4 ${items.length >= 5 ? "sm:grid-cols-3 lg:grid-cols-5" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
      {items.map((s) => (
        <div key={s.label} className="rounded-xl bg-primary p-5 text-center text-primary-foreground shadow-sm">
          <dd className="text-4xl font-extrabold text-gold"><Counter value={s.value} plain={s.plain} /></dd>
          <dt className="mt-1 text-sm text-white/85">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
