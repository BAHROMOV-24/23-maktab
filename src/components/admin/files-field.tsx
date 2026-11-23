"use client";

import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileKind, formatBytes } from "@/lib/format";
import { uploadAttachment } from "@/lib/upload";
import { FILE_ACCEPT, type Folder } from "@/lib/upload-rules";
import { ProgressBar } from "./image-field";

export type FileItem = { path: string; name: string; mime: string | null; size_bytes: number | null };
type Pending = { key: string; name: string; progress: number; error?: string };

/** Biriktirilgan fayllar (PDF, DOCX, PPTX, XLSX, 15 MB gacha). */
export function FilesField({ name, defaultItems, folder }: { name: string; defaultItems: FileItem[]; folder: Folder }) {
  const [items, setItems] = useState<FileItem[]>(defaultItems);
  const [pending, setPending] = useState<Pending[]>([]);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const key = `${Date.now()}-${file.name}`;
      setPending((p) => [...p, { key, name: file.name, progress: 0 }]);
      try {
        const r = await uploadAttachment(file, folder, "public-media", (pct) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress: pct } : x))));
        setItems((it) => [...it, r]);
        setPending((p) => p.filter((x) => x.key !== key));
      } catch (err) {
        setPending((p) => p.map((x) => (x.key === key ? { ...x, error: err instanceof Error ? err.message : "Yuklab bo'lmadi" } : x)));
      }
    }
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((f, i) => (
            <li key={f.path} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
              <FileText className="size-6 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block truncate font-medium">{f.name}</span><span className="text-xs text-muted-foreground">{fileKind(f.name, f.mime)} · {formatBytes(f.size_bytes)}</span></span>
              <Button type="button" variant="ghost" size="icon" aria-label={`Faylni olib tashlash: ${f.name}`} onClick={() => setItems((x) => x.filter((_, j) => j !== i))}><X /></Button>
            </li>
          ))}
        </ul>
      )}
      {pending.map((p) => (
        <div key={p.key} className="space-y-1 rounded-lg border p-2 text-sm">
          <div className="flex justify-between gap-2"><span className="truncate">{p.name}</span><span className="text-muted-foreground">{p.error ? "" : `${p.progress}%`}</span></div>
          {p.error ? <p role="alert" className="flex items-center justify-between text-destructive">{p.error}<button type="button" className="underline" onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}>Yopish</button></p> : <ProgressBar value={p.progress} />}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}><Paperclip /> Fayl qo&apos;shish</Button>
      <input ref={input} type="file" multiple accept={FILE_ACCEPT} className="sr-only" aria-label="Fayllarni tanlash" onChange={(e) => onPick(e.target.files)} />
      <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, XLSX. Har biri 15 MB gacha.</p>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}
