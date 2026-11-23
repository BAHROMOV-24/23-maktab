import { Clock, DoorOpen, MapPin, UserRound, Users } from "lucide-react";
import type { Club } from "@/lib/data";
import { Cover } from "./ui-bits";

type Slot = { day: string; from: string; to: string };

export function ClubCard({ c }: { c: Club }) {
  const schedule = (Array.isArray(c.schedule) ? c.schedule : []) as unknown as Slot[];
  const row = "flex items-start gap-2";
  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Cover path={c.thumb_path ?? c.photo_path} alt={c.name} />
      <div className="space-y-3 p-4 text-sm">
        <h3 className="text-lg font-semibold">{c.name}</h3>
        {c.description && <p className="text-muted-foreground">{c.description}</p>}
        {c.leader_name && <p className={row}><UserRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span><b>Rahbar:</b> {c.leader_name}</span></p>}
        {schedule.length > 0 && (
          <p className={row}><Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <span>{schedule.map((s) => `${s.day} ${s.from}–${s.to}`).join(", ")}</span></p>
        )}
        {c.room && <p className={row}><DoorOpen className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span><b>Xona:</b> {c.room}</span></p>}
        {c.members_count != null && <p className={row}><Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span><b>A&apos;zolar:</b> {c.members_count} ta</span></p>}
        {c.type === "tashqi" && c.center_address && <p className={row}><MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span><b>Manzil:</b> {c.center_address}</span></p>}
        {c.type === "tashqi" && c.school_students_count != null && <p className={row}><Users className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /><span><b>Maktabimizdan qatnashmoqda:</b> {c.school_students_count} ta o&apos;quvchi</span></p>}
      </div>
    </article>
  );
}
