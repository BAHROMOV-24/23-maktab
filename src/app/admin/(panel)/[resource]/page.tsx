import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { SortableList } from "@/components/admin/sortable-list";
import { guard } from "@/lib/admin/helpers";
import { rowSubtitle, rowTitle } from "@/lib/admin/load";
import { getResource } from "@/lib/admin/resources";
import { requireRole } from "@/lib/auth";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  const r = getResource((await params).resource);
  return { title: r?.title };
}

export default async function ResourceList({ params }: PageProps<"/admin/[resource]">) {
  const slug = (await params).resource;
  const res = getResource(slug);
  if (!res) notFound();
  if (res.singleton) redirect(`/admin/${slug}`);
  if (slug === "reyestr-yozuv") redirect("/admin/reyestr");
  await requireRole(res.roles);
  const { r, db } = await guard(slug);

  let q = db.from(r.table).select("*");
  q = r.orderable ? q.order("sort_order") : q.order("created_at", { ascending: false });
  const { data } = await q.limit(500);
  const rows = (data ?? []) as Record<string, string>[];

  return (
    <>
      <PageHeader title={r.title} description={r.orderable ? "Tartibni o'zgartirish uchun chap tomondagi tutqichdan ushlab sudrang." : undefined} addHref={`/admin/${r.slug}/new`} />
      {r.note && <p className="mb-4 rounded-lg bg-secondary p-3 text-sm">{r.note}</p>}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">Hozircha hech narsa qo&apos;shilmagan. «Qo&apos;shish» tugmasini bosing.</p>
      ) : (
        <SortableList key={rows.map((x) => x.id).join()} slug={r.slug} orderable={!!r.orderable}
          items={rows.map((x) => ({ id: x.id, title: rowTitle(r, x), subtitle: rowSubtitle(r, x), thumb: r.thumbColumn ? x[r.thumbColumn] : null }))} />
      )}
    </>
  );
}
