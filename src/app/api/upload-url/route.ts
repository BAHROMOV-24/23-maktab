import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { FILE_TYPES, FOLDERS, MAX_FILE, MAX_IMAGE_OUT, allowedFolders, extOf } from "@/lib/upload-rules";

const body = z.object({
  bucket: z.enum(["public-media", "private"]),
  folder: z.enum(FOLDERS),
  items: z.array(z.object({ kind: z.enum(["image-main", "image-thumb", "file"]), name: z.string().max(200), size: z.number().int().positive() })).min(1).max(8),
});

/**
 * Brauzer fayllarni to'g'ridan-to'g'ri Storage'ga yuklashi uchun bir martalik imzolangan URL beradi.
 * Fayl Next.js serveri orqali o'tmaydi (Vercel'da 4.5 MB chegarasi bor).
 */
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  const { bucket, folder, items } = parsed.data;
  if (!allowedFolders(s.profile.role, bucket).includes(folder)) return NextResponse.json({ error: "Bu joyga yuklash huquqingiz yo'q" }, { status: 403 });

  const year = new Date().getFullYear();
  const admin = createAdminClient();
  const out: { path: string; signedUrl: string }[] = [];
  for (const it of items) {
    let ext = "webp";
    if (it.kind === "file") {
      ext = extOf(it.name);
      if (!FILE_TYPES[ext]) return NextResponse.json({ error: "Faqat PDF, DOCX, PPTX va XLSX fayllar ruxsat etiladi" }, { status: 400 });
      if (it.size > MAX_FILE) return NextResponse.json({ error: "Fayl hajmi 15 MB dan oshmasligi kerak" }, { status: 400 });
    } else if (it.size > MAX_IMAGE_OUT) {
      return NextResponse.json({ error: "Rasm siqilmagan ko'rinadi (hajmi katta)" }, { status: 400 });
    }
    const path = `${folder}/${year}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "Yuklash havolasini yaratib bo'lmadi" }, { status: 500 });
    out.push({ path, signedUrl: data.signedUrl });
  }
  return NextResponse.json({ items: out }, { headers: { "Cache-Control": "no-store" } });
}
