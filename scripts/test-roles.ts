/* Rollar va RLS sinovi: vaqtincha foydalanuvchilar yaratadi, tekshiradi va o'chiradi. npm run test:roles */
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, svc = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, svc, { auth: { persistSession: false } });
const PW = "Test-" + Math.random().toString(36).slice(2) + "!9Zz";
const created: string[] = [];
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = "") => { cond ? pass++ : fail++; console.log(`${cond ? "✅" : "❌"} ${name}${cond ? "" : "  " + extra}`); };

async function mk(tag: string, role: string, councilSlug?: string) {
  const email = `test-${tag}-${Date.now()}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({ email, password: PW, email_confirm: true });
  if (error) throw error;
  created.push(data.user.id);
  let council_member_id: string | null = null;
  if (councilSlug) council_member_id = (await admin.from("council_members").select("id").eq("slug", councilSlug).single()).data!.id;
  await admin.from("profiles").insert({ id: data.user.id, full_name: tag, role, council_member_id });
  const c = createClient(url, anon, { auth: { persistSession: false } });
  const { error: se } = await c.auth.signInWithPassword({ email, password: PW });
  if (se) throw se;
  return { c, id: data.user.id, council_member_id };
}

async function main() {
  await admin.from("site_settings").update({ require_approval: true }).eq("id", 1);
  const k1 = await mk("k1", "koordinator", "koordinator-1");
  const k2 = await mk("k2", "koordinator", "koordinator-2");
  const ms = await mk("masl", "maslahatchi");
  const ad = await mk("admin", "admin");
  const anonC = createClient(url, anon, { auth: { persistSession: false } });
  const mkPost = (s: SupabaseClient, author: string, status: string, slug: string) =>
    s.from("posts").insert({ author_id: author, title: "Test " + slug, slug, status }).select("id,status").single();

  // --- Anonim
  ok("anon: reyestrni o'qiy olmaydi", (await anonC.from("registry_students").select("id")).error !== null);
  ok("anon: murojaatlarni o'qiy olmaydi", (await anonC.from("inquiries").select("id")).error !== null);
  ok("anon: reyestr statistikasi faqat sonlar", Object.keys((await anonC.rpc("registry_stats")).data ?? {}).sort().join() === "by_club,involved,total");
  ok("anon: murojaatga to'g'ridan-to'g'ri yoza olmaydi", (await anonC.from("inquiries").insert({ name: "x", phone: "1", subject: "s", message: "m" })).error !== null);
  ok("anon: rate_limit_hit chaqira olmaydi", (await anonC.rpc("rate_limit_hit", { p_key: "x", p_max: 1, p_window: 1 })).error !== null);

  // --- Koordinator 1
  const own = k1.council_member_id!, other = k2.council_member_id!;
  ok("koordinator: o'zi uchun 'e'lon qilingan' post yarata olmaydi (tasdiqlash yoqilgan)", (await mkPost(k1.c, own, "published", "t-pub-" + Date.now())).error !== null);
  const draft = await mkPost(k1.c, own, "draft", "t-draft-" + Date.now());
  ok("koordinator: qoralama yarata oladi", !draft.error, draft.error?.message);
  ok("koordinator: boshqa koordinator nomidan post yarata olmaydi", (await mkPost(k1.c, other, "draft", "t-x-" + Date.now())).error !== null);
  const toReview = await k1.c.from("posts").update({ status: "review" }).eq("id", draft.data!.id).select("status");
  ok("koordinator: tekshiruvga yubora oladi", toReview.data?.[0]?.status === "review");
  ok("koordinator: o'zi tasdiqlay olmaydi", (await k1.c.from("posts").update({ status: "published" }).eq("id", draft.data!.id)).error !== null);
  ok("koordinator: postni rad eta olmaydi", (await k1.c.from("posts").update({ status: "rejected" }).eq("id", draft.data!.id)).error !== null);

  // --- Koordinator 2 -> 1 ning postiga tegolmaydi
  const k2see = await k2.c.from("posts").select("id").eq("id", draft.data!.id);
  ok("boshqa koordinator: tekshiruvdagi postni ko'ra olmaydi", (k2see.data ?? []).length === 0);
  const k2upd = await k2.c.from("posts").update({ title: "Hack" }).eq("id", draft.data!.id).select("id");
  ok("boshqa koordinator: postni tahrirlay olmaydi", (k2upd.data ?? []).length === 0);
  const k2del = await k2.c.from("posts").delete({ count: "exact" }).eq("id", draft.data!.id);
  ok("boshqa koordinator: postni o'chira olmaydi", (k2del.count ?? 0) === 0);
  ok("anon: tekshiruvdagi postni ko'ra olmaydi", ((await anonC.from("posts").select("id").eq("id", draft.data!.id)).data ?? []).length === 0);

  // --- Koordinatorning boshqa huquqlari
  ok("koordinator: reyestrni o'qiy olmaydi (bo'sh)", ((await k1.c.from("registry_students").select("id")).data ?? []).length === 0);
  ok("koordinator: to'garak qo'sha olmaydi", (await k1.c.from("clubs").insert({ type: "ichki", name: "x", slug: "x" + Date.now() })).error !== null);
  const cmUpd = await k1.c.from("council_members").update({ first_name: "Hack" }).eq("id", own).select("id");
  ok("koordinator: kengash a'zosini o'zgartira olmaydi", (cmUpd.data ?? []).length === 0);
  const roleUpd = await k1.c.from("profiles").update({ role: "superadmin" }).eq("id", k1.id).select("id");
  ok("koordinator: o'z rolini ko'tara olmaydi", (roleUpd.data ?? []).length === 0);
  ok("koordinator: boshqa profillarni ko'ra olmaydi", ((await k1.c.from("profiles").select("id")).data ?? []).length === 1);
  ok("koordinator: xotira ko'rsatkichini ola olmaydi", (await k1.c.rpc("storage_usage")).error !== null);
  ok("koordinator: sozlamalarni o'zgartira olmaydi", ((await k1.c.from("site_settings").update({ require_approval: false }).eq("id", 1).select("id")).data ?? []).length === 0);

  // --- Maslahatchi
  const pub = await ms.c.from("posts").update({ status: "published" }).eq("id", draft.data!.id).select("status,published_at");
  ok("maslahatchi: tekshiruvdagi postni tasdiqlay oladi", pub.data?.[0]?.status === "published" && !!pub.data?.[0]?.published_at, pub.error?.message);
  ok("maslahatchi: reyestrga ruxsati yo'q (bo'sh)", ((await ms.c.from("registry_students").select("id")).data ?? []).length === 0);
  ok("maslahatchi: murojaatlarni ko'ra olmaydi (bo'sh)", ((await ms.c.from("inquiries").select("id")).data ?? []).length === 0);
  ok("maslahatchi: kengash a'zosini tahrirlay oladi", ((await ms.c.from("council_members").update({ grade: "10-A" }).eq("id", own).select("id")).data ?? []).length === 1);
  ok("maslahatchi: to'garak qo'sha olmaydi", (await ms.c.from("clubs").insert({ type: "ichki", name: "x", slug: "y" + Date.now() })).error !== null);
  ok("maslahatchi: xotira ko'rsatkichini ola olmaydi", (await ms.c.rpc("storage_usage")).error !== null);

  // --- Koordinator e'lon qilingan postni tahrirlasa -> qayta tekshiruvga
  const edit = await k1.c.from("posts").update({ title: "Test tahrir" }).eq("id", draft.data!.id).select("status");
  ok("koordinator: e'lon qilingan postni tahrirlasa 'tekshiruvda'ga qaytadi", edit.data?.[0]?.status === "published" ? false : edit.data?.[0]?.status === "review", JSON.stringify(edit.data) + edit.error?.message);

  // --- Tasdiqlash o'chirilsa koordinator o'zi e'lon qila oladi
  await admin.from("site_settings").update({ require_approval: false }).eq("id", 1);
  const free = await mkPost(k1.c, own, "published", "t-free-" + Date.now());
  ok("tasdiqlash o'chiq: koordinator o'zi e'lon qila oladi", !free.error && free.data?.status === "published", free.error?.message);
  await admin.from("site_settings").update({ require_approval: true }).eq("id", 1);

  // --- Admin
  ok("admin: reyestrni o'qiy oladi", ((await ad.c.from("registry_students").select("id")).data ?? []).length > 0);
  ok("admin: murojaatlarni ko'ra oladi", (await ad.c.from("inquiries").select("id")).error === null);
  const club = await ad.c.from("clubs").insert({ type: "ichki", name: "Test to'garak", slug: "t-club-" + Date.now() }).select("id").single();
  ok("admin: to'garak qo'sha oladi", !club.error, club.error?.message);
  if (club.data) await ad.c.from("clubs").delete().eq("id", club.data.id);
  ok("admin: xotira ko'rsatkichini oladi", !(await ad.c.rpc("storage_usage")).error);
  ok("admin: profillarni ko'ra oladi", ((await ad.c.from("profiles").select("id")).data ?? []).length >= 4);

  // --- Storage
  const file = new Blob(["x"], { type: "image/webp" });
  ok("koordinator: public-media'ga yuklay oladi", !(await k1.c.storage.from("public-media").upload(`_test/${Date.now()}.webp`, file, { contentType: "image/webp" })).error);
  ok("koordinator: private bucket'ga yuklay olmaydi", (await k1.c.storage.from("private").upload(`_test/${Date.now()}.webp`, file, { contentType: "image/webp" })).error !== null);
  ok("admin: private bucket'ga yuklay oladi", !(await ad.c.storage.from("private").upload(`_test/${Date.now()}.webp`, file, { contentType: "image/webp" })).error);
  ok("anon: private bucket'dan o'qiy olmaydi", (await anonC.storage.from("private").download("_test/none.webp")).error !== null);

  // --- Tozalash
  await admin.from("posts").delete().like("slug", "t-%");
  await admin.from("council_members").update({ grade: "10-sinf" }).eq("id", own);
  for (const b of ["public-media", "private"]) {
    const { data } = await admin.storage.from(b).list("_test");
    if (data?.length) await admin.storage.from(b).remove(data.map((f) => `_test/${f.name}`));
  }
  for (const id of created) await admin.auth.admin.deleteUser(id);
  console.log(`\nNatija: ${pass} ta o'tdi, ${fail} ta xato`);
  process.exit(fail ? 1 : 0);
}
main().catch(async (e) => { console.error(e); for (const id of created) await admin.auth.admin.deleteUser(id); process.exit(1); });
