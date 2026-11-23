"use client";

import imageCompression from "browser-image-compression";
import { FILE_TYPES, TARGET_MAIN_MB, TARGET_THUMB_MB, checkFileName, checkImageFile, extOf, type Bucket, type Folder } from "@/lib/upload-rules";

export type UploadedImage = { path: string; thumb_path: string; size: number; thumbSize: number };
export type UploadedFile = { path: string; name: string; mime: string; size_bytes: number };

/** Rasmni brauzerda siqadi: asosiy (1920px, WebP, ~300 KB) va kichik (400px) nusxa. */
export async function compressPair(file: File) {
  const err = checkImageFile(file);
  if (err) throw new Error(err);
  const common = { fileType: "image/webp", initialQuality: 0.8, useWebWorker: true } as const;
  const [main, thumb] = await Promise.all([
    imageCompression(file, { ...common, maxWidthOrHeight: 1920, maxSizeMB: TARGET_MAIN_MB }),
    imageCompression(file, { ...common, maxWidthOrHeight: 400, maxSizeMB: TARGET_THUMB_MB }),
  ]);
  return { main, thumb };
}

async function sign(bucket: Bucket, folder: Folder, items: { kind: string; name: string; size: number }[]) {
  const r = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bucket, folder, items }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error ?? "Yuklash ruxsati olinmadi");
  return j.items as { path: string; signedUrl: string }[];
}

/** XHR bilan yuklaydi (progress uchun). Uzoq muddatli kesh: 1 yil. */
function put(signedUrl: string, blob: Blob, onProgress: (loaded: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Yuklashda xatolik (" + xhr.status + ")")));
    xhr.onerror = () => reject(new Error("Tarmoq xatosi. Internetni tekshiring."));
    const fd = new FormData();
    fd.append("cacheControl", "31536000");
    fd.append("", blob);
    xhr.send(fd);
  });
}

export async function uploadImage(file: File, folder: Folder, onProgress: (pct: number) => void): Promise<UploadedImage> {
  onProgress(2);
  const { main, thumb } = await compressPair(file);
  onProgress(15);
  const [a, b] = await sign("public-media", folder, [
    { kind: "image-main", name: "main.webp", size: main.size }, { kind: "image-thumb", name: "thumb.webp", size: thumb.size },
  ]);
  const total = main.size + thumb.size;
  let m = 0, t = 0;
  const report = () => onProgress(15 + Math.round(((m + t) / total) * 85));
  await Promise.all([put(a.signedUrl, main, (l) => { m = l; report(); }), put(b.signedUrl, thumb, (l) => { t = l; report(); })]);
  onProgress(100);
  return { path: a.path, thumb_path: b.path, size: main.size, thumbSize: thumb.size };
}

export async function uploadAttachment(file: File, folder: Folder, bucket: Bucket, onProgress: (pct: number) => void): Promise<UploadedFile> {
  const err = checkFileName(file.name, file.size);
  if (err) throw new Error(err);
  const mime = FILE_TYPES[extOf(file.name)];
  const [s] = await sign(bucket, folder, [{ kind: "file", name: file.name, size: file.size }]);
  await put(s.signedUrl, new Blob([file], { type: mime }), (l) => onProgress(Math.round((l / file.size) * 100)));
  onProgress(100);
  return { path: s.path, name: file.name, mime, size_bytes: file.size };
}
