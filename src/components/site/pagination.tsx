import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, total, perPage, hrefFor }: { page: number; total: number; perPage: number; hrefFor: (p: number) => string }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const item = "grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm transition hover:bg-accent";
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="Sahifalash" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && <Link href={hrefFor(page - 1)} className={item} aria-label="Oldingi sahifa"><ChevronLeft className="size-4" /></Link>}
      {nums.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && p - nums[i - 1] > 1 && <span aria-hidden className="px-1">…</span>}
          <Link href={hrefFor(p)} aria-current={p === page ? "page" : undefined} className={`${item} ${p === page ? "border-primary bg-primary text-primary-foreground hover:bg-primary" : ""}`}>{p}</Link>
        </span>
      ))}
      {page < pages && <Link href={hrefFor(page + 1)} className={item} aria-label="Keyingi sahifa"><ChevronRight className="size-4" /></Link>}
    </nav>
  );
}
