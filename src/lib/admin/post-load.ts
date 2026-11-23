import "server-only";
import { COUNCIL_STAFF, requireRole } from "@/lib/auth";
import { fullName } from "@/lib/format";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function loadPostFormData() {
  const { profile, sb } = await requireRole();
  const db = sb as any;
  const isStaff = COUNCIL_STAFF.includes(profile.role);
  const [{ data: settings }, authorsRes] = await Promise.all([
    db.from("site_settings").select("require_approval").eq("id", 1).single(),
    isStaff ? db.from("council_members").select("id,first_name,last_name,role").neq("role", "maslahatchi").order("sort_order") : Promise.resolve({ data: [] }),
  ]);
  return {
    profile, db, isStaff, needApproval: settings?.require_approval !== false,
    authors: ((authorsRes.data ?? []) as any[]).map((m) => ({ value: m.id as string, label: fullName(m) })),
  };
}
