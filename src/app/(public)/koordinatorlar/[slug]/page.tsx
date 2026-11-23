import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/cards";
import { Pagination } from "@/components/site/pagination";
import { Avatar, Container, EmptyState, SectionHeading } from "@/components/site/ui-bits";
import { getCouncilBySlug, getPostsPage } from "@/lib/data";
import { fullName } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";

type Props = PageProps<"/koordinatorlar/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = await getCouncilBySlug((await params).slug);
  if (!m) return {};
  const img = mediaUrl(m.photo_path);
  return { title: fullName(m), description: m.direction_name ?? "O'quvchilar kengashi a'zosi", openGraph: { images: img ? [img] : undefined } };
}

export default async function CoordinatorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const m = await getCouncilBySlug(slug);
  if (!m || m.role === "maslahatchi") notFound();
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const { posts, total, perPage } = await getPostsPage(page, m.id, 9);

  return (
    <Container className="space-y-10">
      <section className="flex flex-col items-center gap-6 rounded-xl border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
        <Avatar path={m.photo_path} name={fullName(m)} size={140} />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{fullName(m)}</h1>
          <p className="text-muted-foreground">{[m.role === "lider" ? "Kengash lideri" : "Koordinator", m.grade].filter(Boolean).join(" · ")}</p>
          {m.direction_name && <p className="text-lg font-semibold text-primary">{m.direction_name}</p>}
          {m.direction_description && <p className="max-w-2xl whitespace-pre-line text-muted-foreground">{m.direction_description}</p>}
        </div>
      </section>
      <section>
        <SectionHeading title="Qilingan ishlar" />
        {posts.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
            <Pagination page={page} total={total} perPage={perPage} hrefFor={(p) => `/koordinatorlar/${m.slug}?page=${p}`} />
          </>
        ) : <EmptyState text={t.empty.news} />}
      </section>
    </Container>
  );
}
