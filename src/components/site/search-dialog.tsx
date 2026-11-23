"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

type Hit = { kind: string; title: string; url: string; snippet: string | null };
const KIND: Record<string, string> = { yangilik: "Yangilik", elon: "E'lon", tadbir: "Tadbir", oqituvchi: "O'qituvchi" };

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const shown = q.trim().length < 2 ? null : hits;

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        setHits(await r.json());
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => { clearTimeout(id); ctrl.abort(); };
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" aria-label={t.nav.search} />}>
        <Search className="size-5" />
      </DialogTrigger>
      <DialogContent className="top-[20%] translate-y-0 sm:max-w-xl">
        <DialogHeader><DialogTitle>{t.nav.search}</DialogTitle></DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Yangilik, e'lon, tadbir yoki o'qituvchi..." aria-label={t.nav.search} />
        <div className="max-h-[50vh] overflow-y-auto" aria-live="polite">
          {loading && <p className="py-3 text-sm text-muted-foreground">{t.common.loading}</p>}
          {!loading && shown && shown.length === 0 && <p className="py-3 text-sm text-muted-foreground">{t.empty.search}</p>}
          <ul className="divide-y">
            {shown?.map((h) => (
              <li key={h.url}>
                <Link href={h.url} onClick={() => setOpen(false)} className="block rounded px-1 py-2.5 hover:bg-accent">
                  <span className="mr-2 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">{KIND[h.kind] ?? h.kind}</span>
                  <span className="font-medium">{h.title}</span>
                  {h.snippet && <span className="mt-0.5 line-clamp-1 block text-sm text-muted-foreground">{h.snippet}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
