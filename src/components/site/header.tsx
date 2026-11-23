"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NAV } from "@/lib/nav";
import { A11yPanel } from "./a11y-panel";
import { SearchDialog } from "./search-dialog";
import { Logo } from "./logo";

export function Header({ name, logoUrl, bell }: { name: string; logoUrl: string | null; bell?: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href?: string) => href && (href === "/" ? path === "/" : path.startsWith(href));
  const groupActive = (c: { href: string }[]) => c.some((i) => active(i.href));
  const base = "inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
        <Link href="/" className="mr-2 flex items-center gap-2.5 font-bold text-primary" aria-label={name}>
          <Logo url={logoUrl} />
          <span className="text-lg leading-tight">{name}</span>
        </Link>

        <nav aria-label="Asosiy menyu" className="ml-auto hidden items-center xl:flex">
          {NAV.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger className={`${base} ${groupActive(item.children) ? "text-primary" : ""}`}>
                  {item.label} <ChevronDown className="size-3.5" aria-hidden />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-56">
                  {item.children.map((c) => (
                    <DropdownMenuItem key={c.href} render={<Link href={c.href} />}>{c.label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link key={item.href} href={item.href!} aria-current={active(item.href) ? "page" : undefined}
                className={`${base} ${active(item.href) ? "bg-accent text-primary" : ""}`}>{item.label}</Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center xl:ml-2">
          <SearchDialog />
          {bell}
          <A11yPanel />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="xl:hidden" aria-label="Menyuni ochish" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto">
              <SheetTitle className="px-4 pt-4 text-primary">{name}</SheetTitle>
              <nav aria-label="Mobil menyu" className="flex flex-col gap-1 p-4">
                {NAV.map((item) =>
                  item.children ? (
                    <div key={item.label} className="mt-2">
                      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} onClick={() => setOpen(false)}
                          className={`block rounded-md px-3 py-2.5 text-base hover:bg-accent ${active(c.href) ? "bg-accent font-medium text-primary" : ""}`}>{c.label}</Link>
                      ))}
                    </div>
                  ) : (
                    <Link key={item.href} href={item.href!} onClick={() => setOpen(false)}
                      className={`rounded-md px-3 py-2.5 text-base hover:bg-accent ${active(item.href) ? "bg-accent font-medium text-primary" : ""}`}>{item.label}</Link>
                  ),
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
