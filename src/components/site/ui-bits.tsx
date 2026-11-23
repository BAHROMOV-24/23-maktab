import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";

export function SectionHeading({ title, href, hrefLabel = t.common.all }: { title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="relative pb-2 text-2xl font-bold tracking-tight text-foreground after:absolute after:bottom-0 after:left-0 after:h-1 after:w-12 after:rounded-full after:bg-gold sm:text-3xl">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
          {hrefLabel} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-white/75">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 py-10 sm:py-12 ${className}`}>{children}</div>;
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed bg-card px-4 py-12 text-center text-muted-foreground">
      <ImageIcon className="mb-2 size-8 opacity-40" aria-hidden />
      <p>{text}</p>
    </div>
  );
}

/** Kartochka rasmi: tayyor kichik nusxa, lazy loading. Rasm bo'lmasa chiroyli placeholder. */
export function Cover({ path, alt, className = "aspect-[16/10]", priority = false }: { path: string | null | undefined; alt: string; className?: string; priority?: boolean }) {
  const src = mediaUrl(path);
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br from-primary/15 via-secondary to-gold/20 ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover" loading={priority ? undefined : "lazy"} priority={priority} />
      ) : (
        <div className="grid h-full place-items-center text-primary/30"><ImageIcon className="size-10" aria-hidden /></div>
      )}
    </div>
  );
}

export function Avatar({ path, name, size = 96, className = "" }: { path: string | null | undefined; name: string; size?: number; className?: string }) {
  const src = mediaUrl(path);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  return src ? (
    <Image src={src} alt={name} width={size} height={size} loading="lazy"
      className={`rounded-full object-cover ring-4 ring-background ${className}`} style={{ width: size, height: size }} />
  ) : (
    <span role="img" aria-label={name} style={{ width: size, height: size, fontSize: size / 3 }}
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-navy font-semibold text-primary-foreground ring-4 ring-background ${className}`}>
      {initials || "?"}
    </span>
  );
}

export function NewBadge() {
  return <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold uppercase text-white">{t.common.new}</span>;
}
