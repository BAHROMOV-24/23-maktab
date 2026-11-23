import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUp, Download, Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { RegistryFiles } from "@/components/admin/registry-files";
import { Button } from "@/components/ui/button";
import { deleteResource } from "@/lib/admin/actions";
import { queryRegistry, STATUS_LABEL } from "@/lib/admin/registry-query";

export const metadata: Metadata = { title: "Reyestr" };
const COLS = [["full_name", "Ism-familiya"], ["grade", "Sinf"], ["club", "To'garak"], ["status", "Holati"]] as const;

export default async function RegistryAdmin({ searchParams }: PageProps<"/admin/reyestr">) {
  const sp = await searchParams;
  const { rows, sb, params } = await queryRegistry(sp);
  const [{ data: clubs }, { data: regFiles }] = await Promise.all([
    sb.from("clubs").select("id,name").order("name"),
    sb.from("registry_files").select("id,name,mime,size_bytes,created_at").order("created_at", { ascending: false }),
  ]);
  const qs = (over: Record<string, string>) => new URLSearchParams(Object.entries({ ...params, ...over }).filter(([, v]) => v)).toString();
  const sel = "h-9 rounded-lg border border-input bg-background px-2 text-sm";

  return (
    <>
      <PageHeader title="Reyestrdagi o'quvchilar" description="Maxfiy ma'lumot: faqat admin va superadmin ko'radi. Saytda faqat umumiy statistika chiqadi." addHref="/admin/reyestr-yozuv/new" addLabel="O'quvchi qo'shish">
        <Button variant="outline" render={<a href={`/admin/reyestr/export?${qs({})}`} />}><Download /> Excel (.xlsx)</Button>
      </PageHeader>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border bg-card p-3">
        <input name="q" defaultValue={params.q} placeholder="Ism bo'yicha qidirish" aria-label="Ism bo'yicha qidirish" className="h-9 min-w-40 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
        <input name="grade" defaultValue={params.grade} placeholder="Sinf" aria-label="Sinf" className="h-9 w-24 rounded-lg border border-input bg-background px-3 text-sm" />
        <select name="club" defaultValue={params.club} aria-label="To'garak" className={sel}>
          <option value="">Barcha to&apos;garaklar</option><option value="none">To&apos;garaksiz</option>
          {(clubs ?? []).map((c: { id: string; name: string }) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="status" defaultValue={params.status} aria-label="Holati" className={sel}>
          <option value="">Barcha holatlar</option>{Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input type="hidden" name="sort" value={params.sort} /><input type="hidden" name="dir" value={params.dir} />
        <Button type="submit">Qo&apos;llash</Button>
        <Button type="button" variant="ghost" render={<Link href="/admin/reyestr" />}>Tozalash</Button>
      </form>

      <p className="mb-2 text-sm text-muted-foreground">Jami: <b>{rows.length}</b> ta</p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {COLS.map(([key, label]) => {
                const active = params.sort === key;
                return (
                  <th key={key} className="p-3 font-semibold" aria-sort={active ? (params.dir === "asc" ? "ascending" : "descending") : "none"}>
                    <Link href={`/admin/reyestr?${qs({ sort: key, dir: active && params.dir === "asc" ? "desc" : "asc" })}`} className="inline-flex items-center gap-1 hover:text-primary">
                      {label}{active && (params.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
                    </Link>
                  </th>
                );
              })}
              <th className="w-24 p-3"><span className="sr-only">Amallar</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Hech narsa topilmadi</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-medium">{r.full_name}</td><td className="p-3">{r.grade ?? "—"}</td><td className="p-3">{r.club?.name ?? "—"}</td><td className="p-3">{STATUS_LABEL[r.status]}</td>
                <td className="p-2"><div className="flex justify-end">
                  <Button variant="ghost" size="icon" aria-label={`Tahrirlash: ${r.full_name}`} render={<Link href={`/admin/reyestr-yozuv/${r.id}`} />}><Pencil /></Button>
                  <DeleteButton name={r.full_name} action={deleteResource.bind(null, "reyestr-yozuv", r.id)} />
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RegistryFiles files={regFiles ?? []} />
    </>
  );
}
