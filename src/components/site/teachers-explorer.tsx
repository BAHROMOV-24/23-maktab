"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, EmptyState } from "./ui-bits";

export type TeacherLite = { id: string; full_name: string; subject: string; category: string | null; experience_years: number | null; achievements: string | null; photo: string | null };

export function TeachersExplorer({ teachers, emptyText }: { teachers: TeacherLite[]; emptyText: string }) {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const subjects = useMemo(() => [...new Set(teachers.map((t) => t.subject))].sort((a, b) => a.localeCompare(b, "uz")), [teachers]);
  const list = teachers.filter((t) => (!subject || t.subject === subject) && t.full_name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ism bo'yicha qidirish" aria-label="Ism bo'yicha qidirish" className="pl-9" />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Fan bo'yicha filtr"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm sm:w-60">
          <option value="">Barcha fanlar</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {list.length === 0 ? <EmptyState text={teachers.length ? "Hech narsa topilmadi" : emptyText} /> : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <li key={t.id}>
              <Link href={`/oqituvchilar/${t.id}`} className="flex h-full gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <Avatar path={t.photo} name={t.full_name} size={72} />
                <div className="min-w-0 space-y-0.5 text-sm">
                  <h3 className="font-semibold leading-snug">{t.full_name}</h3>
                  <p className="font-medium text-primary">{t.subject}</p>
                  <p className="text-muted-foreground">{[t.category, t.experience_years != null ? `${t.experience_years} yil staj` : null].filter(Boolean).join(" · ")}</p>
                  {t.achievements && <p className="line-clamp-2 text-xs text-muted-foreground">{t.achievements}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
