"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mediaUrl } from "@/lib/media";
import { uploadImage } from "@/lib/upload";
import type { Folder } from "@/lib/upload-rules";
import { formatBytes } from "@/lib/format";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Yuklanmoqda">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

/**
 * Bitta rasm maydoni. Rasm brauzerda siqiladi (WebP, ~300 KB), so'ng Storage'ga to'g'ridan-to'g'ri yuklanadi.
 * Forma ikkita yashirin maydon yuboradi: asosiy nusxa yo'li va kichik nusxa yo'li.
 */
export function ImageField({ name, thumbName, defaultPath, defaultThumb, label, invalid, folder }: {
  name: string; thumbName?: string; defaultPath?: string | null; defaultThumb?: string | null; label: string; invalid?: boolean; folder: Folder;
}) {
  const [path, setPath] = useState(defaultPath ?? "");
  const [thumb, setThumb] = useState(defaultThumb ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const src = mediaUrl(thumb || path);

  async function onPick(file?: File) {
    if (!file) return;
    setError(""); setInfo(""); setProgress(0);
    try {
      const r = await uploadImage(file, folder, setProgress);
      setPath(r.path); setThumb(r.thumb_path);
      setInfo(`Yuklandi: ${formatBytes(file.size)} → ${formatBytes(r.size)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yuklab bo'lmadi");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 rounded-lg border p-3 ${invalid ? "border-destructive" : ""}`}>
      <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        {src ? <Image src={src} alt={label} fill className="object-cover" sizes="96px" /> : <ImageIcon className="size-8 opacity-50" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={progress !== null} onClick={() => input.current?.click()}>
            <Upload /> {src ? "Almashtirish" : "Rasm tanlash"}
          </Button>
          {src && progress === null && <Button type="button" variant="ghost" size="sm" onClick={() => { setPath(""); setThumb(""); setInfo(""); }}><X /> Olib tashlash</Button>}
        </div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={`${label}: faylni tanlash`} onChange={(e) => onPick(e.target.files?.[0])} />
        {progress !== null && <ProgressBar value={progress} />}
        {info && progress === null && <p className="text-xs text-green-700">{info}. Saqlash tugmasini bosing.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">JPG, PNG yoki WebP, 10 MB gacha. Avtomatik siqiladi.</p>
      </div>
      <input type="hidden" name={name} value={path} />
      {thumbName && <input type="hidden" name={thumbName} value={thumb} />}
    </div>
  );
}
