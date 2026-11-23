import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { FilesList } from "@/components/site/files-list";
import { Gallery } from "@/components/site/gallery";
import { Cover, Container } from "@/components/site/ui-bits";
import { getPostBySlug } from "@/lib/data";
import { formatDate, fullName, safeHtml, stripHtml } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export const revalidate = 300;
type Props = PageProps<"/yangiliklar/[slug]">;
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPostBySlug((await params).slug);
  if (!p) return {};
  const img = mediaUrl(p.cover_path ?? p.post_images[0]?.path);
  const description = p.excerpt || stripHtml(p.body);
  return { title: p.title, description, openGraph: { title: p.title, description, type: "article", images: img ? [img] : undefined }, twitter: { card: "summary_large_image" } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) notFound();
  const images = [...p.post_images].sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ src: mediaUrl(i.path)!, thumb: mediaUrl(i.thumb_path ?? i.path)!, alt: i.alt ?? p.title }));
  const share = `https://t.me/share/url?url=${encodeURIComponent(`${site}/yangiliklar/${p.slug}`)}&text=${encodeURIComponent(p.title)}`;

  return (
    <Container className="max-w-4xl">
      <Link href="/koordinatorlar" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden />Barcha yangiliklar</Link>
      <article className="space-y-6">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{p.title}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(p.published_at)}
            {p.author && <> · <Link className="text-primary hover:underline" href={`/koordinatorlar/${p.author.slug}`}>{fullName(p.author)}</Link></>}
          </p>
        </header>
        {p.cover_path && <Cover path={p.cover_path} alt={p.title} className="aspect-[16/9] rounded-xl" priority />}
        <div className="prose-school" dangerouslySetInnerHTML={{ __html: safeHtml(p.body) }} />
        {images.length > 0 && <section aria-label="Fotolavhalar"><h2 className="mb-3 text-xl font-semibold">Fotolavhalar</h2><Gallery images={images} /></section>}
        {p.post_files.length > 0 && <section aria-label="Fayllar"><h2 className="mb-3 text-xl font-semibold">Biriktirilgan fayllar</h2><FilesList files={p.post_files} /></section>}
        <a href={share} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#229ED9] px-4 py-2.5 font-medium text-white hover:opacity-90">
          <Send className="size-4" aria-hidden /> Telegram&apos;da ulashish
        </a>
      </article>
    </Container>
  );
}

export function generateStaticParams() {
  return [];
}
