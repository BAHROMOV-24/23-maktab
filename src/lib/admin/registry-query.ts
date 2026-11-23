import "server-only";
import { requireRole } from "@/lib/auth";

export type RegRow = { id: string; full_name: string; grade: string | null; status: string; note: string | null; club: { name: string } | null };
export const STATUS_LABEL: Record<string, string> = { qatnashmoqda: "Qatnashmoqda", qatnashmayapti: "Qatnashmayapti", kutilmoqda: "Kutilmoqda" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function queryRegistry(sp: Record<string, string | string[] | undefined>) {
  const { sb } = await requireRole(["superadmin", "admin"]);
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const q = get("q").trim().slice(0, 60).replace(/[%_\\,()]/g, "");
  const club = get("club"), status = get("status"), grade = get("grade").trim().slice(0, 20).replace(/[%_\\,()]/g, "");
  const sort = ["full_name", "grade", "club", "status"].includes(get("sort")) ? get("sort") : "full_name";
  const dir = get("dir") === "desc" ? -1 : 1;

  let query: any = (sb as any).from("registry_students").select("id,full_name,grade,status,note,club:clubs(name)").limit(5000);
  if (q) query = query.ilike("full_name", `%${q}%`);
  if (grade) query = query.ilike("grade", `%${grade}%`);
  if (/^[0-9a-f-]{36}$/i.test(club)) query = query.eq("club_id", club);
  if (club === "none") query = query.is("club_id", null);
  if (["qatnashmoqda", "qatnashmayapti", "kutilmoqda"].includes(status)) query = query.eq("status", status);
  const { data } = await query;
  const val = (r: RegRow) => (sort === "club" ? r.club?.name : (r as any)[sort]) ?? "";
  const rows = ((data ?? []) as RegRow[]).sort((a, b) => String(val(a)).localeCompare(String(val(b)), "uz", { numeric: true }) * dir);
  return { rows, sb: sb as any, params: { q, club, status, grade, sort, dir: dir === 1 ? "asc" : "desc" } };
}
