import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceForm } from "@/components/admin/resource-form";
import { guard } from "@/lib/admin/helpers";
import { loadRelations } from "@/lib/admin/load";
import { getResource } from "@/lib/admin/resources";

export const metadata: Metadata = { title: "Yangi yozuv" };

export default async function NewResource({ params }: PageProps<"/admin/[resource]/new">) {
  const slug = (await params).resource;
  const res = getResource(slug);
  if (!res) notFound();
  if (res.singleton) redirect(`/admin/${slug}`);
  const { r, db } = await guard(slug);
  const back = r.slug === "reyestr-yozuv" ? "/admin/reyestr" : `/admin/${r.slug}`;
  return (
    <>
      <PageHeader title={`Yangi ${r.singular} qo'shish`} />
      <ResourceForm resource={r} id={null} values={{ ...r.defaults }} relations={await loadRelations(db, r)} backHref={back} />
    </>
  );
}
