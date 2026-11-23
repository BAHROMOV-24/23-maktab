import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { InquiryStatus } from "@/components/admin/inquiry-status";
import { PageHeader } from "@/components/admin/page-header";
import { requireRole } from "@/lib/auth";
import { deleteInquiry } from "@/lib/admin/inquiry-actions";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Murojaatlar" };

export default async function InquiriesPage() {
  const { sb } = await requireRole(["superadmin", "admin"]);
  const { data } = await sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(300);
  const rows = data ?? [];
  const fresh = rows.filter((r) => r.status === "yangi").length;
  return (
    <>
      <PageHeader title="Direktorga murojaatlar" description={`Yangi murojaatlar: ${fresh} ta`} />
      {rows.length === 0 ? <p className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">Hozircha murojaatlar yo&apos;q.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="space-y-2 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{r.subject}</h2>
                <span className="ml-auto text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-sm">{r.message}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-medium">{r.name}</span>
                <a href={`tel:${r.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="size-3.5" aria-hidden />{r.phone}</a>
                <span className="ml-auto flex items-center gap-1">
                  <InquiryStatus id={r.id} status={r.status} />
                  <DeleteButton name={r.subject} action={deleteInquiry.bind(null, r.id)} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
