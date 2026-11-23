import type { Metadata } from "next";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { COUNCIL_STAFF, requireRole } from "@/lib/auth";
import { STATUS_COLOR } from "@/lib/admin/labels";
import { deletePost } from "@/lib/admin/post-actions";
import { formatDate, fullName } from "@/lib/format";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Postlar" };
const STATUSES = ["review", "draft", "published", "rejected"] as const;

export default async function PostsPage({ searchParams }: PageProps<"/admin/postlar">) {
  const { profile, sb } = await requireRole();
  const sp = await searchParams;
  const isStaff = COUNCIL_STAFF.includes(profile.role);
  const status = STATUSES.find((s) => s === sp.status);

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let q: any = sb.from("posts").select("id,title,status,updated_at,author_id,author:council_members!posts_author_id_fkey(first_name,last_name)").order("updated_at", { ascending: false }).limit(300);
  if (!isStaff) q = q.eq("author_id", profile.council_member_id ?? "00000000-0000-0000-0000-000000000000");
  const { data } = await q;
  const all = (data ?? []) as { id: string; title: string; status: keyof typeof t.status; updated_at: string; author: { first_name: string; last_name: string } | null }[];
  const rows = status ? all.filter((p) => p.status === status) : all;
  const count = (s: string) => all.filter((p) => p.status === s).length;
  const tab = (active: boolean) => `rounded-full border px-3.5 py-1.5 text-sm ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`;

  return (
    <>
      <PageHeader title={isStaff ? "Postlar" : "Mening postlarim"} addHref="/admin/postlar/new" addLabel="Yangi post" />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Holat bo'yicha filtr">
        <Link href="/admin/postlar" className={tab(!status)}>Barchasi ({all.length})</Link>
        {STATUSES.map((s) => <Link key={s} href={`/admin/postlar?status=${s}`} className={tab(status === s)}>{t.status[s]} ({count(s)})</Link>)}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">Postlar yo&apos;q.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/postlar/${p.id}`} className="block truncate font-medium hover:text-primary">{p.title}</Link>
                <p className="truncate text-xs text-muted-foreground">{p.author ? fullName(p.author) : "—"} · {formatDate(p.updated_at)}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[p.status]}`}>{t.status[p.status]}</span>
              <Button variant="ghost" size="icon" aria-label={`Tahrirlash: ${p.title}`} render={<Link href={`/admin/postlar/${p.id}`} />}><Pencil /></Button>
              {(isStaff || p.status === "draft" || p.status === "rejected") && <DeleteButton name={p.title} action={deletePost.bind(null, p.id)} />}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
