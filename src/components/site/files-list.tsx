import { Download, FileText } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { fileKind, formatBytes } from "@/lib/format";

export function FilesList({ files }: { files: { id: string; path: string; name: string; mime: string | null; size_bytes: number | null }[] }) {
  if (files.length === 0) return null;
  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f.id}>
          <a href={mediaUrl(f.path) ?? "#"} download={f.name} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border bg-card p-3 transition hover:border-primary hover:bg-accent">
            <FileText className="size-8 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{f.name}</span>
              <span className="text-xs text-muted-foreground">{fileKind(f.name, f.mime)}{f.size_bytes ? ` · ${formatBytes(f.size_bytes)}` : ""}</span>
            </span>
            <Download className="size-5 text-muted-foreground" aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
