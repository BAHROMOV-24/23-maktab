import Link from "next/link";
import { CalendarDays, MapPin, Clock } from "lucide-react";
import type { Announcement, EventRow, PostWithAuthor } from "@/lib/data";
import { formatDate, fullName, isNew, stripHtml } from "@/lib/format";
import { Cover, NewBadge } from "./ui-bits";

export function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/yangiliklar/${post.slug}`} className="block">
        <Cover path={post.cover_thumb_path ?? post.cover_path} alt={post.title} />
        <div className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDate(post.published_at)}</span>
            {post.author && <span>· {fullName(post.author)}</span>}
            {isNew(post.published_at) && <NewBadge />}
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt || stripHtml(post.body)}</p>
        </div>
      </Link>
    </article>
  );
}

export function EventCard({ event }: { event: EventRow }) {
  const d = new Date(event.event_date + "T00:00:00");
  const months = ["YAN", "FEV", "MAR", "APR", "MAY", "IYN", "IYL", "AVG", "SEN", "OKT", "NOY", "DEK"];
  return (
    <article className="group flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground" aria-hidden>
        <div className="text-center leading-none">
          <div className="text-2xl font-bold">{d.getDate()}</div>
          <div className="mt-1 text-[11px] tracking-wide text-gold">{months[d.getMonth()]}</div>
        </div>
      </div>
      <div className="min-w-0 space-y-1">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          <Link href={`/tadbirlar/${event.slug}`} className="after:absolute after:inset-0 relative">{event.title}</Link>
        </h3>
        <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden />{formatDate(event.event_date)}</span>
          {event.event_time && <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{event.event_time}</span>}
          {event.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />{event.location}</span>}
        </p>
      </div>
    </article>
  );
}

export function AnnouncementItem({ a }: { a: Announcement }) {
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <Link href={`/elonlar/${a.id}`} className="group block">
        <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {formatDate(a.published_at)} {isNew(a.published_at) && <NewBadge />}
        </div>
        <h3 className="font-medium leading-snug group-hover:text-primary">{a.title}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{stripHtml(a.body, 100)}</p>
      </Link>
    </li>
  );
}
