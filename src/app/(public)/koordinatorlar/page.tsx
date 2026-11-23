import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/site/cards";
import { Pagination } from "@/components/site/pagination";
import { Container, EmptyState, PageHero } from "@/components/site/ui-bits";
import { getCouncil, getPostsPage } from "@/lib/data";
import { fullName } from "@/lib/format";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Koordinatorlar faoliyati", description: "O'quvchilar kengashi koordinatorlarining qilgan ishlari va yangiliklari." };

export default async function ActivityPage({ searchParams }: PageProps<"/koordinatorlar">) {
  const sp = await searchParams;
  const slug = typeof sp.k === "string" ? sp.k : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const council = await getCouncil();
  const coords = council.filter((m) => m.role !== "maslahatchi");
  const current = coords.find((m) => m.slug === slug);
  const { posts, total, perPage } = await getPostsPage(page, current?.id ?? null);
  const href = (p: number) => `/koordinatorlar?${new URLSearchParams({ ...(current ? { k: current.slug } : {}), page: String(p) })}`;
  const chip = (active: boolean) => `rounded-full border px-3.5 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`;

  return (
    <>
      <PageHero title="Koordinatorlar faoliyati" subtitle="Kengash a'zolarining qilgan ishlari" />
      <Container>
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Koordinator bo'yicha filtr">
          <Link href="/koordinatorlar" className={chip(!current)}>{t.common.all}</Link>
          {coords.map((m) => <Link key={m.id} href={`/koordinatorlar?k=${m.slug}`} className={chip(m.id === current?.id)}>{fullName(m)}</Link>)}
        </div>
        {posts.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
            <Pagination page={page} total={total} perPage={perPage} hrefFor={href} />
          </>
        ) : <EmptyState text={t.empty.news} />}
      </Container>
    </>
  );
}
