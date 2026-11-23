"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, CalendarDays, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { NotificationItem } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { t } from "@/lib/i18n";

const KEY = "notif-seen";

function readSeen(): string {
  try {
    const v = localStorage.getItem(KEY);
    if (v) return v;
    const now = new Date().toISOString(); // birinchi tashrif: eski postlar "yangi" hisoblanmaydi
    localStorage.setItem(KEY, now);
    return now;
  } catch {
    return new Date().toISOString();
  }
}

export function NotificationBell({ initial }: { initial: NotificationItem[] }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [items, setItems] = useState(initial);
  const [seen, setSeen] = useState<string>(() => (typeof window === "undefined" ? "" : readSeen()));
  const [snapshot, setSnapshot] = useState<string>(seen); // ochilganda qaysilari yangi bo'lganini ko'rsatish uchun

  const notified = useRef(new Set<string>()); // har bir post uchun toast faqat bir marta

  const unread = items.filter((i) => i.at > seen).length;

  // Realtime: sayt ochiq turganda yangi post/tadbir e'lon qilinsa darhol xabar beradi
  useEffect(() => {
    const sb = createClient();
    const add = (it: NotificationItem, label: string) => {
      if (notified.current.has(it.id)) return;
      notified.current.add(it.id);
      setItems((prev) => (prev.some((p) => p.id === it.id) ? prev : [it, ...prev].slice(0, 10)));
      toast(label, { description: it.title, action: { label: "Ko'rish", onClick: () => (window.location.href = it.href) }, duration: 10000 });
    };
    type PostRow = { id: string; title: string; slug: string; status: string; published_at: string | null };
    type EventRow = { id: string; title: string; slug: string; is_published: boolean; published_at: string };
    const onPost = (payload: { new: PostRow }) => {
      const p = payload.new;
      // published_at faqat "e'lon qilindi" paytida yangilanadi: tahrirlar bildirishnoma bermaydi
      if (p.status !== "published" || !p.published_at || Date.now() - new Date(p.published_at).getTime() > 2 * 60_000) return;
      add({ id: p.id, kind: "post", title: p.title, href: `/yangiliklar/${p.slug}`, at: p.published_at }, "Yangi post e'lon qilindi");
    };
    const channel = sb
      .channel("site-news")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (pl) => onPost(pl as unknown as { new: PostRow }))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (pl) => onPost(pl as unknown as { new: PostRow }))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, (pl) => {
        const e = pl.new as EventRow;
        if (e.is_published) add({ id: e.id, kind: "event", title: e.title, href: `/tadbirlar/${e.slug}`, at: e.published_at }, "Yangi tadbir qo'shildi");
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, []);

  function onOpenChange(open: boolean) {
    if (!open) return;
    setSnapshot(seen);
    const now = new Date().toISOString();
    setSeen(now);
    try { localStorage.setItem(KEY, now); } catch {}
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label={unread > 0 && mounted ? `Bildirishnomalar: ${unread} ta yangi` : "Bildirishnomalar"} />}>
        <Bell className="size-5" />
        {mounted && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-bold leading-5 text-white" aria-hidden>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <p className="border-b px-3 py-2.5 text-sm font-semibold">So&apos;nggi yangiliklar va tadbirlar</p>
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">Hozircha bildirishnomalar yo&apos;q</p>
        ) : (
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {items.map((i) => (
              <li key={i.id}>
                <DropdownMenuItem render={<Link href={i.href} />} className="items-start gap-2.5 px-3 py-2.5">
                  {i.kind === "post" ? <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> : <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium">{i.title}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {i.kind === "post" ? "Post" : "Tadbir"} · {formatDate(i.at)}
                      {i.at > snapshot && <span className="rounded-full bg-destructive px-1.5 py-px text-[10px] font-semibold uppercase text-white">{t.common.new}</span>}
                    </span>
                  </span>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}
        <div className="flex border-t text-sm">
          <Link href="/koordinatorlar" className="flex-1 px-3 py-2.5 text-center text-primary hover:bg-accent">Barcha yangiliklar</Link>
          <Link href="/tadbirlar" className="flex-1 border-l px-3 py-2.5 text-center text-primary hover:bg-accent">Tadbirlar</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
