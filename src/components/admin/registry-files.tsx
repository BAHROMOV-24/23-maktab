"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addRegistryFile, deleteRegistryFile, getRegistryFileUrl } from "@/lib/admin/registry-file-actions";
import { fileKind, formatBytes, formatDate } from "@/lib/format";
import { uploadAttachment } from "@/lib/upload";
import { FILE_ACCEPT } from "@/lib/upload-rules";
import { DeleteButton } from "./delete-button";
import { ProgressBar } from "./image-field";

type F = { id: string; name: string; mime: string | null; size_bytes: number | null; created_at: string };

export function RegistryFiles({ files }: { files: F[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [, start] = useTransition();

  async function onPick(list: FileList | null) {
    for (const file of Array.from(list ?? [])) {
      setProgress(0);
      try {
        const up = await uploadAttachment(file, "registry", "private", setProgress);
        const r = await addRegistryFile(up);
        if (r.error) throw new Error(r.error);
        toast.success(`Yuklandi: ${file.name}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Yuklab bo'lmadi");
      }
    }
    setProgress(null);
    if (input.current) input.current.value = "";
  }

  return (
    <section className="mt-10 space-y-3" aria-labelledby="rf-h">
      <h2 id="rf-h" className="text-lg font-semibold">Reyestrga oid fayllar (yopiq)</h2>
      <p className="text-sm text-muted-foreground">Bu fayllar ommaga ko&apos;rinmaydi. Faqat shu yerda, 5 daqiqalik vaqtinchalik havola orqali ochiladi.</p>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-lg border bg-card p-2.5 text-sm">
              <FileText className="size-6 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block truncate font-medium">{f.name}</span><span className="text-xs text-muted-foreground">{fileKind(f.name, f.mime)} · {formatBytes(f.size_bytes)} · {formatDate(f.created_at)}</span></span>
              <Button type="button" variant="outline" size="sm" onClick={() => start(async () => {
                const r = await getRegistryFileUrl(f.id);
                if (r.url) window.open(r.url, "_blank", "noopener"); else toast.error(r.error ?? "Ochib bo'lmadi");
              })}><ExternalLink /> Ochish</Button>
              <DeleteButton name={f.name} action={deleteRegistryFile.bind(null, f.id)} />
            </li>
          ))}
        </ul>
      )}
      {progress !== null && <ProgressBar value={progress} />}
      <Button type="button" variant="outline" disabled={progress !== null} onClick={() => input.current?.click()}><Paperclip /> Fayl yuklash</Button>
      <input ref={input} type="file" multiple accept={FILE_ACCEPT} className="sr-only" aria-label="Reyestr fayllarini tanlash" onChange={(e) => onPick(e.target.files)} />
    </section>
  );
}
