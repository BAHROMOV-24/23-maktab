import Link from "next/link";
import type { CouncilMember } from "@/lib/data";
import { fullName } from "@/lib/format";
import { Avatar } from "./ui-bits";

const ROLE = { maslahatchi: "Maktab maslahatchisi", lider: "Kengash lideri", koordinator: "Koordinator" } as const;

export function MemberCard({ m, featured = false }: { m: CouncilMember; featured?: boolean }) {
  const linkable = m.role !== "maslahatchi";
  const body = (
    <div className={`flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm transition ${linkable ? "hover:-translate-y-0.5 hover:border-primary hover:shadow-md" : ""} ${featured ? "border-gold/60" : ""}`}>
      <Avatar path={m.thumb_path ?? m.photo_path} name={fullName(m)} size={featured ? 112 : 88} />
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-foreground/70 text-primary">{ROLE[m.role]}</p>
        <h3 className="font-semibold leading-snug">{fullName(m)}</h3>
        {m.grade && <p className="text-sm text-muted-foreground">{m.grade}</p>}
        {m.direction_name && <p className="text-sm font-medium text-primary">{m.direction_name}</p>}
      </div>
    </div>
  );
  return linkable ? <Link href={`/koordinatorlar/${m.slug}`} className="block h-full">{body}</Link> : body;
}
