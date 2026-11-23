import Link from "next/link";
import { AlertTriangle, ClipboardCheck } from "lucide-react";
import { Meter } from "@/components/admin/meter";
import { requireRole, ADMINS, COUNCIL_STAFF } from "@/lib/auth";
import { OP_LABEL, STATUS_COLOR, TABLE_LABEL } from "@/lib/admin/labels";
import { formatDate } from "@/lib/format";
import { t } from "@/lib/i18n";

const GB = 1024 ** 3, MB = 1024 ** 2;

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const { profile, sb } = await requireRole();
  const sp = await searchParams;
  const isAdmin = ADMINS.includes(profile.role);
  const isStaff = COUNCIL_STAFF.includes(profile.role);

  const [usage, pending, mine, audit] = await Promise.all([
    isAdmin ? sb.rpc("storage_usage") : null,
    isStaff ? sb.from("posts").select("id,title", { count: "exact" }).eq("status", "review").order("updated_at", { ascending: false }).limit(5) : null,
    !isStaff && profile.council_member_id ? sb.from("posts").select("status").eq("author_id", profile.council_member_id) : null,
    isStaff ? sb.from("audit_log").select("*").order("at", { ascending: false }).limit(10) : null,
  ]);
  const u = usage?.data as { storage_bytes: number; db_bytes: number; files: number } | null | undefined;
  const counts: Record<string, number> = {};
  (mine?.data ?? []).forEach((p) => { counts[p.status] = (counts[p.status] ?? 0) + 1; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Xush kelibsiz, {profile.full_name || "foydalanuvchi"}!</h1>
        <p className="text-sm text-muted-foreground">Sizning rolingiz: {t.roles[profile.role]}</p>
      </div>
      {sp.denied && <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">Bu bo&apos;limga kirish huquqingiz yo&apos;q.</p>}

      {isStaff && pending && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><ClipboardCheck className="size-5 text-amber-600" aria-hidden />Tekshiruvda turgan postlar: <b className="text-xl">{pending.count ?? 0}</b></h2>
          {(pending.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Hozircha tekshiruvni kutayotgan post yo&apos;q.</p> : (
            <ul className="divide-y text-sm">{pending.data!.map((p) => <li key={p.id}><Link className="block py-2 text-primary hover:underline" href={`/admin/postlar/${p.id}`}>{p.title}</Link></li>)}</ul>
          )}
        </section>
      )}

      {!isStaff && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Mening postlarim</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["draft", "review", "published", "rejected"] as const).map((s) => (
              <div key={s} className={`rounded-lg p-3 text-center ${STATUS_COLOR[s]}`}><div className="text-2xl font-bold">{counts[s] ?? 0}</div><div className="text-xs">{t.status[s]}</div></div>
            ))}
          </div>
          {(counts.rejected ?? 0) > 0 && <p className="mt-3 flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="size-4" aria-hidden />Rad etilgan postlaringiz bor. Sababini ko&apos;rib, tuzatib qayta yuboring.</p>}
          <Link href="/admin/postlar/new" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Yangi post yozish</Link>
        </section>
      )}

      {isAdmin && (
        <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Xotira</h2>
          {u ? (
            <>
              <Meter label={`Fayllar (${u.files} ta)`} used={u.storage_bytes} limit={1 * GB} />
              <Meter label="Ma'lumotlar bazasi" used={u.db_bytes} limit={500 * MB} />
            </>
          ) : <p className="text-sm text-muted-foreground">Xotira ma&apos;lumotini olib bo&apos;lmadi.</p>}
        </section>
      )}

      {isStaff && audit && (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">So&apos;nggi o&apos;zgarishlar</h2>
          {(audit.data ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Hozircha o&apos;zgarishlar yo&apos;q.</p> : (
            <ul className="divide-y text-sm">
              {audit.data!.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-x-2 py-2">
                  <b>{TABLE_LABEL[a.table_name] ?? a.table_name}</b>{a.summary && <span>«{a.summary}»</span>}
                  <span className="text-muted-foreground">{OP_LABEL[a.op] ?? a.op}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{formatDate(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
