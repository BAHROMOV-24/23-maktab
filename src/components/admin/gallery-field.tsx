"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mediaUrl } from "@/lib/media";
import { uploadImage } from "@/lib/upload";
import type { Folder } from "@/lib/upload-rules";
import { ProgressBar } from "./image-field";

export type GalleryItem = { path: string; thumb_path: string | null; alt: string | null };
type Pending = { key: string; name: string; progress: number; error?: string };

/** Fotolavhalar: bir nechta rasmni birdaniga tanlash mumkin. Natija yashirin JSON maydonida yuboriladi. */
export function GalleryField({ name, defaultItems, folder }: { name: string; defaultItems: GalleryItem[]; folder: Folder }) {
  const [items, setItems] = useState<GalleryItem[]>(defaultItems);
  const [pending, setPending] = useState<Pending[]>([]);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const entries: Pending[] = list.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setPending((p) => [...p, ...entries]);
    const patch = (key: string, v: Partial<Pending>) => setPending((p) => p.map((x) => (x.key === key ? { ...x, ...v } : x)));
    // Ketma-ket (2 tadan) yuklaymiz: telefon xotirasi va tarmoqni ortiqcha yuklamaslik uchun
    const queue = list.map((f, i) => [f, entries[i]] as const);
    const worker = async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        const [file, e] = job;
        try {
          const r = await uploadImage(file, folder, (pct) => patch(e.key, { progress: pct }));
          setItems((it) => [...it, { path: r.path, thumb_path: r.thumb_path, alt: null }]);
          setPending((p) => p.filter((x) => x.key !== e.key));
        } catch (err) {
          patch(e.key, { error: err instanceof Error ? err.message : "Yuklab bo'lmadi" });
        }
      }
    };
    await Promise.all([worker(), worker()]);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.path} className="space-y-1.5">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={mediaUrl(it.thumb_path ?? it.path)!} alt={it.alt ?? ""} fill className="object-cover" sizes="160px" />
                <button type="button" aria-label="Rasmni olib tashlash" onClick={() => setItems((x) => x.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid size-7 place-items-center rounded-full bg-black/70 text-white hover:bg-destructive"><X className="size-4" /></button>
              </div>
              <Input aria-label="Rasm izohi (alt matn)" placeholder="Izoh (alt)" value={it.alt ?? ""} className="h-8 text-xs" maxLength={150}
                onChange={(e) => setItems((x) => x.map((y, j) => (j === i ? { ...y, alt: e.target.value || null } : y)))} />
            </li>
          ))}
        </ul>
      )}
      {pending.map((p) => (
        <div key={p.key} className="space-y-1 rounded-lg border p-2 text-sm">
          <div className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="text-muted-foreground">{p.error ? "" : `${p.progress}%`}</span></div>
          {p.error ? (
            <p role="alert" className="flex items-center justify-between text-destructive">{p.error}<button type="button" className="underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>Yopish</button></p>
          ) : <ProgressBar value={p.progress} />}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}><ImagePlus /> Rasmlar qo&apos;shish</Button>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Fotolavhalarni tanlash" onChange={(e) => onPick(e.target.files)} />
      <p className="text-xs text-muted-foreground">Bir nechta rasmni birdaniga tanlash mumkin. Har biri avtomatik siqiladi.</p>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}
