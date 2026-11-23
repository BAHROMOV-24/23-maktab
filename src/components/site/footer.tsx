import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Bus, Send, Camera, Globe, Play } from "lucide-react";
import type { Settings } from "@/lib/data";
import { NAV } from "@/lib/nav";

export function Footer({ s }: { s: Settings }) {
  const social = [
    { href: s.telegram_url, label: "Telegram", Icon: Send },
    { href: s.instagram_url, label: "Instagram", Icon: Camera },
    { href: s.facebook_url, label: "Facebook", Icon: Globe },
    { href: s.youtube_url, label: "YouTube", Icon: Play },
  ].filter((x) => x.href);
  const row = "flex items-start gap-2.5";

  return (
    <footer className="mt-16 bg-navy text-white/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 text-sm">
          <h2 className="text-lg font-bold text-white">{s.school_name}</h2>
          {s.address && <p className={row}><MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />{s.address}</p>}
          {s.transport && <p className={row}><Bus className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />{s.transport}</p>}
          {s.work_hours && <p className={row}><Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />{s.work_hours}</p>}
          {s.phone && <p className={row}><Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /><a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>{s.phone}</a></p>}
          {s.email && <p className={row}><Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${s.email}`}>{s.email}</a></p>}
          {social.length > 0 && (
            <div className="flex gap-2 pt-2">
              {social.map(({ href, label, Icon }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-gold hover:text-black"><Icon className="size-4" /></a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Sayt bo'limlari" className="text-sm">
          <h2 className="mb-3 font-semibold text-white">Bo&apos;limlar</h2>
          <ul className="space-y-2">
            {NAV.flatMap((i) => i.children ?? [{ label: i.label, href: i.href! }]).map((i) => (
              <li key={i.href}><Link href={i.href} className="hover:text-gold">{i.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-white">Xaritada</h2>
          {s.map_embed_url ? (
            <iframe title="Maktab joylashuvi" src={s.map_embed_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="h-56 w-full rounded-lg border-0" />
          ) : (
            <div className="grid h-56 place-items-center rounded-lg bg-white/5 text-sm text-white/60">Xarita havolasi sozlamalarda kiritiladi</div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {s.school_name}. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
