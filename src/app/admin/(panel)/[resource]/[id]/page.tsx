import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { guard } from "@/lib/admin/helpers";
import { loadRelations } from "@/lib/admin/load";
import { getResource } from "@/lib/admin/resources";

export const metadata: Metadata = { title: "Tahrirlash" };

export default async function EditResource({ params }: PageProps<"/admin/[resource]/[id]">) {
  const { resource: slug, id } = await params;
  const res = getResource(slug);
  if (!res || !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  if (res.singleton) redirect(`/admin/${slug}`);
  const { r, db } = await guard(slug);
  const { data: row } = await db.from(r.table).select("*").eq("id", id).maybeSingle();
  if (!row) notFound();
  for (const f of r.fields) {
    if (!f.child) continue;
    const { data: kids } = await db.from(f.child.table).select("*").eq(f.child.fk, id).order(f.type === "gallery" ? "sort_order" : "path");
    row[f.name] = kids ?? [];
  }
  const back = r.slug === "reyestr-yozuv" ? "/admin/reyestr" : `/admin/${r.slug}`;
  return (
    <>
      <PageHeader title={`Tahrirlash: ${r.singular}`} />
      <ResourceForm resource={r} id={id} values={row} relations={await loadRelations(db, r)} backHref={back} />
    </>
  );
}
