"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHEDULE_DAYS } from "@/lib/admin/resources";

type Slot = { day: string; from: string; to: string };

export function ScheduleField({ name, defaultValue }: { name: string; defaultValue?: unknown }) {
  const [slots, setSlots] = useState<Slot[]>(Array.isArray(defaultValue) ? (defaultValue as Slot[]) : []);
  const set = (i: number, patch: Partial<Slot>) => setSlots((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-2">
      {slots.map((s, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select aria-label="Kun" value={s.day} onChange={(e) => set(i, { day: e.target.value })} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
            {SCHEDULE_DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Input aria-label="Boshlanish vaqti" type="time" value={s.from} onChange={(e) => set(i, { from: e.target.value })} className="w-28" />
          <span aria-hidden>–</span>
          <Input aria-label="Tugash vaqti" type="time" value={s.to} onChange={(e) => set(i, { to: e.target.value })} className="w-28" />
          <Button type="button" variant="ghost" size="icon" aria-label="Qatorni o'chirish" onClick={() => setSlots((x) => x.filter((_, j) => j !== i))}><Trash2 /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => setSlots((s) => [...s, { day: "Dushanba", from: "15:00", to: "16:30" }])}><Plus /> Dars vaqti qo&apos;shish</Button>
      <input type="hidden" name={name} value={JSON.stringify(slots)} />
    </div>
  );
}
