import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { AboutForm } from "@/components/admin/about-form";
import { ResourceForm } from "@/components/admin/resource-form";
import { guard } from "@/lib/admin/helpers";
import { RESOURCES } from "@/lib/admin/resources";

export const metadata: Metadata = { title: "Sayt sozlamalari" };

export default async function SettingsPage({ searchParams }: PageProps<"/admin/sozlamalar">) {
  const { r, db } = await guard("sozlamalar");
  const sp = await searchParams;
  const [{ data: row }, { data: about }] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).single(),
    db.from("about_sections").select("*"),
  ]);
  return (
    <div className="space-y-10">
      <section>
        <PageHeader title="Sayt sozlamalari" description="Maktab nomi, aloqa, statistika va ijtimoiy tarmoqlar." />
        {sp.saved && <p role="status" className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-900">Sozlamalar saqlandi.</p>}
        <ResourceForm resource={RESOURCES.sozlamalar ?? r} id="1" values={row ?? {}} relations={{}} backHref="/admin" />
      </section>
      <section>
        <PageHeader title="«Maktab haqida» matnlari" description="Tarix, maqsad va yutuqlar." />
        <AboutForm sections={about ?? []} />
      </section>
    </div>
  );
}
