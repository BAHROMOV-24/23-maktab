import type { Role } from "@/lib/auth";

/** Universal CRUD sozlamalari. Faqat oddiy ma'lumot (klientga ham uzatiladi). */
import type { Folder } from "@/lib/upload-rules";

export type FieldType = "gallery" | "files" | "text" | "textarea" | "richtext" | "number" | "date" | "select" | "relation" | "checkbox" | "image" | "schedule";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  max?: number;
  section?: string; // forma ichida sarlavha
  options?: { value: string; label: string }[];
  relation?: { table: string; label: string };
  thumbName?: string; // image: kichik nusxa ustuni
  child?: { table: string; fk: string }; // gallery/files: bolalar jadvali
  showIf?: { field: string; value: string };
};

export type Resource = {
  slug: string;
  folder: Folder;
  table: string;
  title: string;
  singular: string;
  roles: Role[];
  fields: Field[];
  orderable?: boolean;
  slugFrom?: string[];
  titleFields: string[];
  subtitleFields?: string[];
  thumbColumn?: string;
  fileColumns: string[];
  children?: { table: string; fk: string; cols: string[] }[];
  singleton?: boolean;
  defaults?: Record<string, string | boolean>;
  note?: string;
};

const A: Role[] = ["superadmin", "admin"];
const S: Role[] = ["superadmin", "admin", "maslahatchi"];
const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
export const SCHEDULE_DAYS = DAYS;

const person = (extra: Field[]): Field[] => [
  ...extra,
  { name: "photo_path", thumbName: "thumb_path", label: "Rasm", type: "image" },
];

export const RESOURCES: Record<string, Resource> = {
  rahbarlar: {
    slug: "rahbarlar", folder: "people", table: "leaders", title: "Rahbarlar", singular: "rahbar", roles: A, orderable: true,
    titleFields: ["full_name"], subtitleFields: ["position"], thumbColumn: "thumb_path", fileColumns: ["photo_path", "thumb_path"],
    fields: person([
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true },
      { name: "position", label: "Lavozimi", type: "text", required: true },
      { name: "bio", label: "Qisqa ma'lumot", type: "textarea" },
      { name: "reception_days", label: "Qabul kunlari", type: "text", hint: "Masalan: Dushanba, Chorshanba 10:00–12:00" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "email", label: "Email", type: "text" },
    ]),
  },
  oqituvchilar: {
    slug: "oqituvchilar", folder: "people", table: "teachers", title: "O'qituvchilar", singular: "o'qituvchi", roles: A, orderable: true,
    titleFields: ["full_name"], subtitleFields: ["subject", "category"], thumbColumn: "thumb_path", fileColumns: ["photo_path", "thumb_path"],
    fields: person([
      { name: "full_name", label: "F.I.Sh.", type: "text", required: true },
      { name: "subject", label: "Fani", type: "text", required: true },
      { name: "category", label: "Toifasi", type: "text", hint: "Masalan: Oliy toifa" },
      { name: "experience_years", label: "Pedagogik staji (yil)", type: "number" },
      { name: "achievements", label: "Yutuqlari", type: "textarea" },
      { name: "bio", label: "Qisqa ma'lumot", type: "textarea" },
    ]),
  },
  kengash: {
    slug: "kengash", folder: "people", table: "council_members", title: "Kengash a'zolari", singular: "kengash a'zosi", roles: S, orderable: true,
    slugFrom: ["first_name", "last_name"], titleFields: ["first_name", "last_name"], subtitleFields: ["role", "direction_name"],
    thumbColumn: "thumb_path", fileColumns: ["photo_path", "thumb_path"], defaults: { is_active: true, role: "koordinator" },
    note: "Maslahatchi 1 ta, lider 1 ta va koordinatorlar 7 ta bo'ladi.",
    fields: person([
      { name: "role", label: "Kengashdagi o'rni", type: "select", required: true, options: [
        { value: "maslahatchi", label: "Maktab maslahatchisi" }, { value: "lider", label: "Lider" }, { value: "koordinator", label: "Koordinator" }] },
      { name: "first_name", label: "Ism", type: "text", required: true },
      { name: "last_name", label: "Familiya", type: "text" },
      { name: "grade", label: "Sinfi", type: "text", hint: "Masalan: 10-A" },
      { name: "direction_name", label: "Yo'nalish nomi", type: "text" },
      { name: "direction_description", label: "Yo'nalish tavsifi", type: "textarea" },
      { name: "is_active", label: "Saytda ko'rsatilsin", type: "checkbox" },
    ]),
  },
  togaraklar: {
    slug: "togaraklar", folder: "clubs", table: "clubs", title: "To'garaklar", singular: "to'garak", roles: A, orderable: true,
    slugFrom: ["name"], titleFields: ["name"], subtitleFields: ["type", "leader_name"], thumbColumn: "thumb_path",
    fileColumns: ["photo_path", "thumb_path"], defaults: { type: "ichki" },
    fields: person([
      { name: "type", label: "Turi", type: "select", required: true, options: [
        { value: "ichki", label: "Ichki (maktabda)" }, { value: "tashqi", label: "Tashqi (\"Kelajak\" markazi)" }] },
      { name: "name", label: "Nomi", type: "text", required: true },
      { name: "leader_name", label: "Rahbar o'qituvchi", type: "text" },
      { name: "schedule", label: "Dars jadvali", type: "schedule" },
      { name: "room", label: "Xona", type: "text" },
      { name: "members_count", label: "A'zolar soni", type: "number" },
      { name: "description", label: "Tavsif", type: "textarea" },
      { name: "center_address", label: "Markaz manzili", type: "text", showIf: { field: "type", value: "tashqi" } },
      { name: "school_students_count", label: "Qatnayotgan maktab o'quvchilari soni", type: "number", showIf: { field: "type", value: "tashqi" } },
    ]),
  },
  tadbirlar: {
    slug: "tadbirlar", folder: "events", table: "events", title: "Tadbirlar", singular: "tadbir", roles: A,
    slugFrom: ["title"], titleFields: ["title"], subtitleFields: ["event_date", "location"], thumbColumn: "cover_thumb_path",
    fileColumns: ["cover_path", "cover_thumb_path"], defaults: { is_published: true },
    children: [{ table: "event_images", fk: "event_id", cols: ["path", "thumb_path"] }, { table: "event_files", fk: "event_id", cols: ["path"] }],
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true },
      { name: "event_date", label: "Sana", type: "date", required: true },
      { name: "event_time", label: "Vaqti", type: "text", hint: "Masalan: 10:00" },
      { name: "location", label: "Joyi", type: "text" },
      { name: "description", label: "Tavsif", type: "richtext" },
      { name: "cover_path", thumbName: "cover_thumb_path", label: "Asosiy rasm", type: "image" },
      { name: "gallery", label: "Fotolavhalar", type: "gallery", child: { table: "event_images", fk: "event_id" } },
      { name: "attachments", label: "Biriktirilgan fayllar", type: "files", child: { table: "event_files", fk: "event_id" } },
      { name: "is_published", label: "Saytda ko'rsatilsin", type: "checkbox" },
    ],
  },
  elonlar: {
    slug: "elonlar", folder: "site", table: "announcements", title: "E'lonlar", singular: "e'lon", roles: A,
    titleFields: ["title"], subtitleFields: ["published_at"], fileColumns: [], defaults: { is_published: true },
    fields: [
      { name: "title", label: "Sarlavha", type: "text", required: true },
      { name: "body", label: "Matn", type: "richtext" },
      { name: "is_published", label: "Saytda ko'rsatilsin", type: "checkbox" },
    ],
  },
  hamkorlar: {
    slug: "hamkorlar", folder: "partners", table: "partners", title: "Hamkorlar", singular: "hamkor", roles: A, orderable: true,
    titleFields: ["name"], subtitleFields: ["url"], thumbColumn: "logo_path", fileColumns: ["logo_path"],
    fields: [
      { name: "name", label: "Nomi", type: "text", required: true },
      { name: "url", label: "Sayt havolasi", type: "text" },
      { name: "logo_path", label: "Logo", type: "image" },
    ],
  },
  slayderlar: {
    slug: "slayderlar", folder: "slides", table: "hero_slides", title: "Bosh sahifa slayderi", singular: "slayd", roles: A, orderable: true,
    titleFields: ["title"], thumbColumn: "thumb_path", fileColumns: ["image_path", "thumb_path"], defaults: { is_active: true },
    note: "1-slayd maktab rasmi bo'lib, \"Sayt sozlamalari\" dan o'zgartiriladi. Bu yerda qo'shimcha slaydlar qo'shiladi.",
    fields: [
      { name: "image_path", thumbName: "thumb_path", label: "Rasm", type: "image", required: true },
      { name: "title", label: "Sarlavha", type: "text" },
      { name: "link_url", label: "Havola", type: "text", hint: "Masalan: /tadbirlar" },
      { name: "is_active", label: "Faol", type: "checkbox" },
    ],
  },
  galereya: {
    slug: "galereya", folder: "gallery", table: "gallery_images", title: "Fotogalereya", singular: "rasm", roles: A, orderable: true,
    titleFields: ["caption"], thumbColumn: "thumb_path", fileColumns: ["path", "thumb_path"],
    fields: [
      { name: "path", thumbName: "thumb_path", label: "Rasm", type: "image", required: true },
      { name: "caption", label: "Izoh", type: "text" },
    ],
  },
  "reyestr-yozuv": {
    slug: "reyestr-yozuv", folder: "site", table: "registry_students", title: "Reyestr", singular: "o'quvchi", roles: A,
    titleFields: ["full_name"], fileColumns: [], defaults: { status: "kutilmoqda" },
    fields: [
      { name: "full_name", label: "Ism-familiya", type: "text", required: true },
      { name: "grade", label: "Sinfi", type: "text" },
      { name: "club_id", label: "Qaysi to'garakka qatnashmoqda", type: "relation", relation: { table: "clubs", label: "name" } },
      { name: "status", label: "Qatnashish holati", type: "select", required: true, options: [
        { value: "qatnashmoqda", label: "Qatnashmoqda" }, { value: "qatnashmayapti", label: "Qatnashmayapti" }, { value: "kutilmoqda", label: "Kutilmoqda" }] },
      { name: "note", label: "Izoh", type: "textarea" },
    ],
  },
  sozlamalar: {
    slug: "sozlamalar", folder: "site", table: "site_settings", title: "Sayt sozlamalari", singular: "sozlama", roles: A, singleton: true,
    titleFields: ["school_name"], fileColumns: ["logo_path", "hero_path", "hero_thumb_path"],
    fields: [
      { name: "school_name", label: "Maktab nomi", type: "text", required: true, section: "Asosiy" },
      { name: "tagline", label: "Shior", type: "text" },
      { name: "about_short", label: "Maktab haqida qisqacha", type: "textarea" },
      { name: "logo_path", label: "Logo", type: "image" },
      { name: "hero_path", thumbName: "hero_thumb_path", label: "Bosh sahifa asosiy rasmi (1-slayd)", type: "image" },
      { name: "student_count", label: "O'quvchilar soni", type: "number", section: "Statistika (bo'sh qoldirilsa, saytda ko'rinmaydi)" },
      { name: "teacher_count", label: "O'qituvchilar soni", type: "number" },
      { name: "class_count", label: "Sinflar soni", type: "number" },
      { name: "club_count", label: "To'garaklar soni", type: "number" },
      { name: "founded_year", label: "Tashkil topgan yil", type: "number" },
      { name: "phone", label: "Telefon", type: "text", section: "Aloqa" },
      { name: "email", label: "Email", type: "text" },
      { name: "address", label: "Manzil", type: "text" },
      { name: "transport", label: "Transport yo'nalishlari", type: "text" },
      { name: "work_hours", label: "Ish vaqti", type: "text" },
      { name: "map_embed_url", label: "Xarita (embed havola)", type: "text", hint: "Google yoki Yandex xaritasidagi \"Ulashish → Xaritani joylashtirish\" havolasi (src qiymati)" },
      { name: "telegram_url", label: "Telegram", type: "text", section: "Ijtimoiy tarmoqlar" },
      { name: "instagram_url", label: "Instagram", type: "text" },
      { name: "facebook_url", label: "Facebook", type: "text" },
      { name: "youtube_url", label: "YouTube", type: "text" },
      { name: "flag_url", label: "Bayroq havolasi", type: "text", section: "Davlat ramzlari" },
      { name: "emblem_url", label: "Gerb havolasi", type: "text" },
      { name: "anthem_url", label: "Madhiya havolasi", type: "text" },
      { name: "require_approval", label: "Koordinator postlari tasdiqlansin", type: "checkbox", section: "Postlar" },
    ],
  },
};

export function getResource(slug: string): Resource | undefined {
  return RESOURCES[slug];
}
/** URL'da ko'rinadigan (sozlamalar va reyestr yozuvlari alohida sahifalarga ega). */
export const LIST_RESOURCES = Object.values(RESOURCES).filter((r) => !r.singleton && r.slug !== "reyestr-yozuv");
