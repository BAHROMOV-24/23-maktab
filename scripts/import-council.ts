/*
 * O'quvchilar kengashi ma'lumotlarini JSON'dan yuklaydi.
 * Ishlatish:  npm run import:council -- scripts/council.json        (haqiqiy)
 *             npm run import:council -- scripts/council.json --dry   (faqat tekshirish)
 * JSON namunasi: scripts/council.example.json (README'ga qarang).
 * Mavjud yozuvlar (maslahatchi, lider, 1..7-koordinator) yangilanadi; rasm admin paneldan yuklanadi.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { z } from "zod";

config({ path: ".env.local" });

const person = z.object({
  first_name: z.string().trim().min(1, "ism kerak").max(80),
  last_name: z.string().trim().max(80).default(""),
  grade: z.string().trim().max(20).optional(),
  direction_name: z.string().trim().max(150).optional(),
  direction_description: z.string().trim().max(3000).optional(),
});
const schema = z.object({
  maslahatchi: person.optional(),
  lider: person.optional(),
  koordinatorlar: z.array(person).max(20).optional(),
});

async function main() {
  const file = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const dry = process.argv.includes("--dry");
  if (!file) { console.error("❌ JSON fayl yo'lini bering: npm run import:council -- scripts/council.json"); process.exit(1); }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("❌ .env.local da NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY kerak."); process.exit(1); }

  let raw: unknown;
  try { raw = JSON.parse((await readFile(file, "utf8")).replace(/^﻿/, "")); }
  catch (e) { console.error(`❌ Faylni o'qib bo'lmadi yoki JSON noto'g'ri: ${(e as Error).message}`); process.exit(1); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error("❌ JSON tuzilmasi noto'g'ri:");
    for (const i of parsed.error.issues) console.error(`   • ${i.path.join(".") || "(ildiz)"}: ${i.message}`);
    process.exit(1);
  }
  const d = parsed.data;
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const rows: { role: "maslahatchi" | "lider" | "koordinator"; slug: string; sort_order: number; p: z.infer<typeof person> }[] = [];
  if (d.maslahatchi) rows.push({ role: "maslahatchi", slug: "maslahatchi", sort_order: 0, p: d.maslahatchi });
  if (d.lider) rows.push({ role: "lider", slug: "lider", sort_order: 1, p: d.lider });
  (d.koordinatorlar ?? []).forEach((p, i) => rows.push({ role: "koordinator", slug: `koordinator-${i + 1}`, sort_order: i + 2, p }));
  if (rows.length === 0) { console.log("Yuklanadigan ma'lumot yo'q."); return; }

  for (const r of rows) {
    const values = {
      role: r.role, slug: r.slug, sort_order: r.sort_order, is_active: true,
      first_name: r.p.first_name, last_name: r.p.last_name,
      grade: r.p.grade ?? null, direction_name: r.p.direction_name ?? null, direction_description: r.p.direction_description ?? null,
    };
    const label = `${r.slug.padEnd(15)} ${r.p.first_name} ${r.p.last_name}`.trim();
    if (dry) { console.log(`  (tekshiruv) ${label}`); continue; }
    const { data: existing } = await sb.from("council_members").select("id").eq("slug", r.slug).maybeSingle();
    const { error } = existing
      ? await sb.from("council_members").update(values).eq("id", existing.id)
      : await sb.from("council_members").insert(values);
    if (error) { console.error(`  ✗ ${label}: ${error.message}`); process.exit(1); }
    console.log(`  ✓ ${existing ? "yangilandi" : "qo'shildi"}: ${label}`);
  }
  console.log(dry ? "\n✅ JSON to'g'ri. Haqiqiy yuklash uchun --dry ni olib tashlang." : "\n✅ Tayyor. Rasmlarni admin paneldan (Kengash a'zolari) yuklang.");
}
main();
