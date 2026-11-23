import "server-only";
import { formatDate } from "@/lib/format";
import type { Resource } from "@/lib/admin/resources";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function loadRelations(db: any, r: Resource) {
  const out: Record<string, { value: string; label: string }[]> = {};
  for (const f of r.fields) {
    if (f.type !== "relation" || !f.relation) continue;
    const { data } = await db.from(f.relation.table).select(`id,${f.relation.label}`).order(f.relation.label);
    out[f.name] = (data ?? []).map((x: any) => ({ value: x.id, label: x[f.relation!.label] }));
  }
  return out;
}

export function rowTitle(r: Resource, row: Record<string, any>) {
  return r.titleFields.map((n) => row[n]).filter(Boolean).join(" ");
}

export function rowSubtitle(r: Resource, row: Record<string, any>) {
  return (r.subtitleFields ?? []).map((n) => {
    const v = row[n];
    if (v == null || v === "") return null;
    const opt = r.fields.find((f) => f.name === n)?.options?.find((o) => o.value === v);
    if (opt) return opt.label;
    return /_date$|_at$/.test(n) ? formatDate(v) : String(v);
  }).filter(Boolean).join(" · ");
}
