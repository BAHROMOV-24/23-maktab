"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, FileText, GraduationCap, Handshake, Image as ImageIcon, LayoutDashboard, Lock, LogOut, Mail, Menu, Puzzle, Settings, Shield, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/app/admin/login/actions";
import type { AdminNavItem } from "@/lib/admin/nav";

const ICONS = { layout: LayoutDashboard, file: FileText, users: Users, user: User, grad: GraduationCap, cal: CalendarDays, bell: Bell,
  puzzle: Puzzle, lock: Lock, mail: Mail, image: ImageIcon, handshake: Handshake, settings: Settings, shield: Shield } as const;

function NavList({ items, onNavigate }: { items: AdminNavItem[]; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin menyu" className="space-y-0.5 p-3">
      {items.map((i) => {
        const Icon = ICONS[i.icon as keyof typeof ICONS];
        const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent"}`}>
            <Icon className="size-4" aria-hidden /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ items, name, roleLabel, children }: { items: AdminNavItem[]; name: string; roleLabel: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const user = (
    <div className="border-t p-3 text-sm">
      <p className="truncate font-medium">{name}</p>
      <p className="mb-2 text-xs text-muted-foreground">{roleLabel}</p>
      <form action={logout}><Button type="submit" variant="outline" size="sm" className="w-full"><LogOut aria-hidden /> Chiqish</Button></form>
    </div>
  );
  return (
    <div className="min-h-svh bg-muted/40 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-card lg:flex">
        <Link href="/admin" className="border-b p-4 text-lg font-bold text-primary">Admin panel</Link>
        <div className="flex-1 overflow-y-auto"><NavList items={items} /></div>
        {user}
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-card px-3 py-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Menyuni ochish" />}><Menu className="size-5" /></SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetTitle className="border-b p-4 text-primary">Admin panel</SheetTitle>
              <div className="flex-1 overflow-y-auto"><NavList items={items} onNavigate={() => setOpen(false)} /></div>
              {user}
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Admin panel</span>
          <Link href="/" target="_blank" className="ml-auto text-sm text-primary">Saytni ko&apos;rish</Link>
        </header>
        <main className="mx-auto max-w-5xl p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
