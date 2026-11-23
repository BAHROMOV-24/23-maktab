import { AlertTriangle } from "lucide-react";
import { formatBytes } from "@/lib/format";

export function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const warn = pct >= 80;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="text-muted-foreground">{formatBytes(used) || "0 B"} / {formatBytes(limit)} ({pct}%)</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={`h-full rounded-full ${warn ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
      {warn && <p className="flex items-center gap-1.5 text-sm font-medium text-destructive"><AlertTriangle className="size-4" aria-hidden />Joy tugab bormoqda! Keraksiz fayllarni o&apos;chiring yoki zaxira nusxa oling.</p>}
    </div>
  );
}
