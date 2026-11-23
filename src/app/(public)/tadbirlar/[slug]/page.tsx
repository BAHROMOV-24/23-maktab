import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Send } from "lucide-react";
import { FilesList } from "@/components/site/files-list";
import { Gallery } from "@/components/site/gallery";
import { Container, Cover } from "@/components/site/ui-bits";
import { getEventBySlug } from "@/lib/data";
import { formatDate, safeHtml, stripHtml } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export const revalidate = 300;
type Props = PageProps<"/tadbirlar/[slug]">;
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEventBySlug((await params).slug);
  if (!e) return {};
  const img = mediaUrl(e.cover_path);
  const description = stripHtml(e.description);
  return { title: e.title, description, openGraph: { title: e.title, description, images: img ? [img] : undefined } };
}

export default async function EventPage({ params }: Props) {
  const e = await getEventBySlug((await params).slug);
  if (!e) notFound();
  const images = [...e.event_images].sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ src: mediaUrl(i.path)!, thumb: mediaUrl(i.thumb_path ?? i.path)!, alt: i.alt ?? e.title }));
  const share = `https://t.me/share/url?url=${encodeURIComponent(`${site}/tadbirlar/${e.slug}`)}&text=${encodeURIComponent(e.title)}`;
  return (
    <Container className="max-w-4xl">
      <Link href="/tadbirlar" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden />Barcha tadbirlar</Link>
      <article className="space-y-6">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{e.title}</h1>
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />{formatDate(e.event_date)}</span>
          {e.event_time && <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden />{e.event_time}</span>}
          {e.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{e.location}</span>}
        </p>
        {e.cover_path && <Cover path={e.cover_path} alt={e.title} className="aspect-[16/9] rounded-xl" priority />}
        <div className="prose-school" dangerouslySetInnerHTML={{ __html: safeHtml(e.description) }} />
        {images.length > 0 && <section><h2 className="mb-3 text-xl font-semibold">Fotolavhalar</h2><Gallery images={images} /></section>}
        {e.event_files.length > 0 && <section><h2 className="mb-3 text-xl font-semibold">Fayllar</h2><FilesList files={e.event_files} /></section>}
        <a href={share} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#229ED9] px-4 py-2.5 font-medium text-white hover:opacity-90"><Send className="size-4" aria-hidden /> Telegram&apos;da ulashish</a>
      </article>
    </Container>
  );
}

export function generateStaticParams() {
  return [];
}
