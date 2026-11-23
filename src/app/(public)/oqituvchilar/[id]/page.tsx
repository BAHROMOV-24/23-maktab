import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Avatar, Container } from "@/components/site/ui-bits";
import { getTeacher } from "@/lib/data";
import { mediaUrl } from "@/lib/media";

export const revalidate = 300;
type Props = PageProps<"/oqituvchilar/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await getTeacher(id);
  if (!t) return {};
  const img = mediaUrl(t.photo_path);
  return { title: t.full_name, description: `${t.full_name} — ${t.subject} o'qituvchisi`, openGraph: { images: img ? [img] : undefined } };
}

export default async function TeacherPage({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const t = await getTeacher(id);
  if (!t) notFound();
  const facts = [
    ["Fani", t.subject], ["Toifasi", t.category], ["Pedagogik staji", t.experience_years != null ? `${t.experience_years} yil` : null],
  ].filter((f) => f[1]);
  return (
    <Container className="max-w-4xl">
      <Link href="/oqituvchilar" className="mb-6 inline-flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="size-4" aria-hidden />Barcha o&apos;qituvchilar</Link>
      <article className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm sm:flex-row">
        <Avatar path={t.photo_path} name={t.full_name} size={160} />
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{t.full_name}</h1>
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {facts.map(([k, v]) => (<div key={k as string}><dt className="text-xs uppercase text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>))}
          </dl>
          {t.bio && <p className="whitespace-pre-line">{t.bio}</p>}
          {t.achievements && <section><h2 className="mb-1 font-semibold">Yutuqlari</h2><p className="whitespace-pre-line text-muted-foreground">{t.achievements}</p></section>}
        </div>
      </article>
    </Container>
  );
}

export function generateStaticParams() {
  return [];
}
