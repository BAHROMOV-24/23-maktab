import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/site/ui-bits";
import { getAnnouncement } from "@/lib/data";
import { formatDate, safeHtml, stripHtml } from "@/lib/format";

export const revalidate = 300;
type Props = PageProps<"/elonlar/[id]">;
const ok = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = ok(id) ? await getAnnouncement(id) : null;
  return a ? { title: a.title, description: stripHtml(a.body) } : {};
}

export default async function AnnouncementPage({ params }: Props) {
  const { id } = await params;
  const a = ok(id) ? await getAnnouncement(id) : null;
  if (!a) notFound();
  return (
    <Container className="max-w-3xl">
      <Link href="/elonlar" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden />Barcha e&apos;lonlar</Link>
      <article className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{a.title}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(a.published_at)}</p>
        <div className="prose-school" dangerouslySetInnerHTML={{ __html: safeHtml(a.body) }} />
      </article>
    </Container>
  );
}

export function generateStaticParams() {
  return [];
}
