/* Namunaviy ma'lumotlar va birinchi superadmin. Ishga tushirish: npm run seed */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const email = process.env.SEED_SUPERADMIN_EMAIL!;
const password = process.env.SEED_SUPERADMIN_PASSWORD!;
if (!url || !key || !email || !password) {
  console.error("❌ .env.local da NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_SUPERADMIN_EMAIL va SEED_SUPERADMIN_PASSWORD kerak.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function empty(table: string) {
  const { count } = await sb.from(table).select("*", { count: "exact", head: true });
  return (count ?? 0) === 0;
}
async function must<T>(p: PromiseLike<{ data: T; error: { message: string } | null }>, what: string) {
  const { data, error } = await p;
  if (error) { console.error(`❌ ${what}: ${error.message}`); process.exit(1); }
  return data;
}

async function superadmin() {
  const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
  let user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) { console.error("❌ Superadmin yaratilmadi:", error.message); process.exit(1); }
    user = data.user;
    console.log("✅ Superadmin yaratildi:", email);
  } else console.log("• Superadmin allaqachon bor:", email);
  await must(sb.from("profiles").upsert({ id: user!.id, full_name: "Bosh administrator", role: "superadmin" }), "profil");
}

async function main() {
  await superadmin();

  await must(sb.from("site_settings").update({
    school_name: "23-maktab", tagline: "Bilim — kelajak poydevori",
    about_short: "Zamonaviy ta'lim, mehribon jamoa va yorqin kelajak.",
    phone: "+998 71 000 00 00", email: "info@23-maktab.uz",
    address: "Toshkent shahri, Namuna tumani, Maktab ko'chasi, 23-uy",
    transport: "Avtobus: 12, 45; Marshrutka: 101, 203",
    telegram_url: "https://t.me/", instagram_url: "https://instagram.com/",
    student_count: 1250, teacher_count: 78, club_count: 12, class_count: 42, founded_year: 1968,
  }).eq("id", 1), "sozlamalar");

  await must(sb.from("about_sections").upsert([
    { key: "tarix", title: "Maktab tarixi", body: "<p>Maktabimiz 1968-yilda tashkil topgan. Shu yillar davomida minglab o'quvchilar bilim olib, hayotda o'z o'rnini topdi.</p>" },
    { key: "maqsad", title: "Maqsadimiz", body: "<p>Har bir o'quvchiga sifatli ta'lim berish, ularni vatanparvar, bilimli va mustaqil fikrlaydigan shaxs sifatida tarbiyalash.</p>" },
    { key: "yutuqlar", title: "Yutuqlarimiz", body: "<ul><li>Fan olimpiadalarida tuman va viloyat g'oliblari</li><li>Sport musobaqalarida sovrinli o'rinlar</li><li>Ijodiy tanlovlarda faol ishtirok</li></ul>" },
  ]), "maktab haqida");

  if (await empty("leaders")) {
    await must(sb.from("leaders").insert([
      { full_name: "Direktor F.I.Sh.", position: "Maktab direktori", reception_days: "Dushanba, Chorshanba 10:00–12:00", phone: "+998 71 000 00 01", bio: "Ma'lumot tez orada kiritiladi.", sort_order: 1 },
      { full_name: "O'rinbosar F.I.Sh.", position: "O'quv ishlari bo'yicha direktor o'rinbosari", reception_days: "Seshanba, Payshanba 14:00–16:00", sort_order: 2 },
      { full_name: "O'rinbosar F.I.Sh.", position: "Ma'naviy-ma'rifiy ishlar bo'yicha direktor o'rinbosari", reception_days: "Juma 10:00–12:00", sort_order: 3 },
    ]), "rahbarlar");
  }
  if (await empty("teachers")) {
    const subjects = ["Matematika", "Ona tili va adabiyot", "Ingliz tili", "Fizika", "Kimyo", "Biologiya", "Tarix", "Informatika"];
    const cats = ["Oliy toifa", "Birinchi toifa", "Ikkinchi toifa"];
    await must(sb.from("teachers").insert(subjects.map((s, i) => ({
      full_name: `${i + 1}-o'qituvchi`, subject: s, category: cats[i % 3], experience_years: 5 + i * 3,
      achievements: "Ma'lumot tez orada kiritiladi.", sort_order: i,
    }))), "o'qituvchilar");
  }

  const councilRows = [
    { role: "maslahatchi", first_name: "Maslahatchi", last_name: "", slug: "maslahatchi", direction_name: "Maktab maslahatchisi", sort_order: 0 },
    { role: "lider", first_name: "Lider", last_name: "", slug: "lider", grade: "11-sinf", direction_name: "Kengash lideri", sort_order: 1 },
    ...Array.from({ length: 7 }, (_, i) => ({
      role: "koordinator", first_name: `${i + 1}-koordinator`, last_name: "", slug: `koordinator-${i + 1}`,
      grade: "10-sinf", direction_name: "Yo'nalish nomi kiritiladi", direction_description: "Yo'nalish tavsifi kiritiladi.", sort_order: i + 2,
    })),
  ];
  await must(sb.from("council_members").upsert(councilRows as never, { onConflict: "slug", ignoreDuplicates: true }), "kengash");

  if (await empty("clubs")) {
    const sched = [{ day: "Dushanba", from: "15:00", to: "16:30" }, { day: "Chorshanba", from: "15:00", to: "16:30" }];
    await must(sb.from("clubs").insert([
      { type: "ichki", name: "Shaxmat", slug: "shaxmat", leader_name: "Rahbar F.I.Sh.", schedule: sched, room: "21-xona", members_count: 18, description: "Shaxmat o'yini sirlarini o'rganamiz.", sort_order: 1 },
      { type: "ichki", name: "Robototexnika", slug: "robototexnika", leader_name: "Rahbar F.I.Sh.", schedule: sched, room: "Informatika xonasi", members_count: 15, description: "Robotlar yasash va dasturlash.", sort_order: 2 },
      { type: "ichki", name: "Rasm chizish", slug: "rasm", leader_name: "Rahbar F.I.Sh.", schedule: sched, room: "14-xona", members_count: 20, sort_order: 3 },
      { type: "tashqi", name: "Dasturlash", slug: "kelajak-dasturlash", leader_name: "Mentor F.I.Sh.", schedule: sched, center_address: "\"Kelajak\" markazi, Namuna tumani", school_students_count: 12, description: "Python va veb-dasturlash asoslari.", sort_order: 1 },
      { type: "tashqi", name: "Ingliz tili", slug: "kelajak-ingliz", leader_name: "Mentor F.I.Sh.", schedule: sched, center_address: "\"Kelajak\" markazi, Namuna tumani", school_students_count: 9, sort_order: 2 },
    ]), "to'garaklar");
  }

  if (await empty("registry_students")) {
    const clubs = await must(sb.from("clubs").select("id"), "clubs");
    await must(sb.from("registry_students").insert(Array.from({ length: 12 }, (_, i) => ({
      full_name: `Namuna o'quvchi ${i + 1}`, grade: `${5 + (i % 6)}-sinf`,
      club_id: i < 8 ? clubs![i % clubs!.length].id : null,
      status: i < 8 ? "qatnashmoqda" : "kutilmoqda",
    }))), "reyestr");
  }

  if (await empty("announcements")) {
    await must(sb.from("announcements").insert([
      { title: "Ota-onalar majlisi", body: "<p>Chorshanba kuni soat 17:00 da ota-onalar majlisi bo'lib o'tadi.</p>" },
      { title: "Dars jadvali o'zgardi", body: "<p>Payshanba kuni 3-4-darslar almashtirildi.</p>" },
      { title: "Qishki ta'til", body: "<p>Qishki ta'til sanalari e'lon qilindi.</p>" },
    ]), "e'lonlar");
  }
  if (await empty("events")) {
    const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
    await must(sb.from("events").insert([
      { title: "Bilimlar bayrami", slug: "bilimlar-bayrami", event_date: d(-40), event_time: "09:00", location: "Maktab hovlisi", description: "<p>1-sentabr — Bilimlar bayrami tantanali nishonlandi.</p>" },
      { title: "Fan olimpiadasi", slug: "fan-olimpiadasi", event_date: d(7), event_time: "10:00", location: "Majlislar zali", description: "<p>Maktab ichki fan olimpiadasi.</p>" },
      { title: "Sport kuni", slug: "sport-kuni", event_date: d(21), event_time: "11:00", location: "Sport maydoni", description: "<p>Umummaktab sport musobaqalari.</p>" },
    ]), "tadbirlar");
  }
  if (await empty("partners")) {
    await must(sb.from("partners").insert([{ name: "\"Kelajak\" markazi", sort_order: 1 }, { name: "Tuman XTB", sort_order: 2 }]), "hamkorlar");
  }

  if (await empty("posts")) {
    const coords = await must(sb.from("council_members").select("id,slug").like("slug", "koordinator-%").order("slug").limit(3), "koordinatorlar");
    await must(sb.from("posts").insert(coords!.map((c, i) => ({
      author_id: c.id, title: `Namunaviy post ${i + 1}`, slug: `namunaviy-post-${i + 1}`, status: "published" as const,
      excerpt: "Koordinatorlar faoliyati haqida qisqa ma'lumot.", body: "<p>Bu namunaviy post matni. Haqiqiy postlar admin paneldan joylanadi.</p>",
      published_at: new Date(Date.now() - i * 86400000).toISOString(),
    }))), "postlar");
  }
  console.log("✅ Seed tugadi.");
}
main();
