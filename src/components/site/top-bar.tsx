import Link from "next/link";
import { Phone, Send, Camera } from "lucide-react";
import type { Settings } from "@/lib/data";

export function TopBar({ s }: { s: Settings }) {
  const link = "hover:underline underline-offset-2";
  return (
    <div className="bg-navy text-white text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
        <nav aria-label="Davlat ramzlari" className="flex items-center gap-3 sm:gap-5">
          <a className={link} href={s.flag_url ?? "#"} target="_blank" rel="noopener noreferrer">Bayroq</a>
          <a className={link} href={s.emblem_url ?? "#"} target="_blank" rel="noopener noreferrer">Gerb</a>
          <a className={link} href={s.anthem_url ?? "#"} target="_blank" rel="noopener noreferrer">Madhiya</a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          {s.phone && (
            <a className={`${link} flex items-center gap-1`} href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>
              <Phone className="size-3" aria-hidden /> <span className="hidden xs:inline sm:inline">{s.phone}</span>
            </a>
          )}
          {s.telegram_url && <Link aria-label="Telegram" className={link} href={s.telegram_url} target="_blank"><Send className="size-3.5" /></Link>}
          {s.instagram_url && <Link aria-label="Instagram" className={link} href={s.instagram_url} target="_blank"><Camera className="size-3.5" /></Link>}
        </div>
      </div>
    </div>
  );
}
