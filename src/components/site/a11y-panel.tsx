"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";

type State = { font: number; contrast: boolean; gray: boolean };
const DEFAULT: State = { font: 0, contrast: false, gray: false };

function apply(s: State) {
  const h = document.documentElement;
  h.style.fontSize = s.font ? `${100 + s.font * 12.5}%` : "";
  h.classList.toggle("a11y-contrast", s.contrast);
  h.classList.toggle("a11y-gray", s.gray);
}

export function A11yPanel() {
  const [s, setS] = useState<State>(() => {
    if (typeof window === "undefined") return DEFAULT;
    try { return { ...DEFAULT, ...(JSON.parse(localStorage.getItem("a11y") || "null") ?? {}) }; } catch { return DEFAULT; }
  });

  function update(next: State) {
    setS(next);
    apply(next);
    try { localStorage.setItem("a11y", JSON.stringify(next)); } catch {}
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t.a11y.title} />}>
        <Eye className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 space-y-2 p-3">
        <p className="text-sm font-semibold">{t.a11y.title}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="flex-1" disabled={s.font <= 0}
            onClick={() => update({ ...s, font: Math.max(0, s.font - 1) })}>A−</Button>
          <Button type="button" variant="outline" size="sm" className="flex-1" disabled={s.font >= 4}
            onClick={() => update({ ...s, font: Math.min(4, s.font + 1) })}>A+</Button>
        </div>
        <p className="text-xs text-muted-foreground">{t.a11y.fontBigger}</p>
        <Button type="button" variant={s.contrast ? "default" : "outline"} size="sm" className="w-full"
          aria-pressed={s.contrast} onClick={() => update({ ...s, contrast: !s.contrast })}>{t.a11y.contrast}</Button>
        <Button type="button" variant={s.gray ? "default" : "outline"} size="sm" className="w-full"
          aria-pressed={s.gray} onClick={() => update({ ...s, gray: !s.gray })}>{t.a11y.grayscale}</Button>
        <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => update(DEFAULT)}>{t.a11y.reset}</Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
