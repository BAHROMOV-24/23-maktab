import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";
import { Stats, type Stat } from "@/components/site/stats";
import { Avatar, Container, EmptyState, PageHero, SectionHeading } from "@/components/site/ui-bits";
import { getLeaders, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Rahbarlar", description: "Maktab direktori va direktor o'rinbosarlari." };
export const revalidate = 300;

export default async function LeadersPage() {
  const [leaders, s] = await Promise.all([getLeaders(), getSettings()]);
  const stats: Stat[] = [
    s.student_count && { label: "Jami o'quvchilar", value: s.student_count },
    s.class_count && { label: "Sinflar soni", value: s.class_count },
    s.teacher_count && { label: "O'qituvchilar", value: s.teacher_count },
    s.club_count && { label: "To'garaklar", value: s.club_count },
  ].filter(Boolean) as Stat[];

  return (
    <>
      <PageHero title="Rahbarlar" subtitle="Maktab direktori va direktor o'rinbosarlari" />
      <Container className="space-y-12">
        {leaders.length === 0 ? <EmptyState text="Rahbarlar ro'yxati hozircha kiritilmagan" /> : (
          <div className="grid gap-6 md:grid-cols-2">
            {leaders.map((l) => (
              <article key={l.id} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row">
                <Avatar path={l.thumb_path ?? l.photo_path} name={l.full_name} size={112} />
                <div className="min-w-0 space-y-2 text-sm">
                  <h2 className="text-xl font-semibold">{l.full_name}</h2>
                  <p className="font-medium text-primary">{l.position}</p>
                  {l.bio && <p className="text-muted-foreground">{l.bio}</p>}
                  {l.reception_days && <p className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /><span><b>Qabul kunlari:</b> {l.reception_days}</span></p>}
                  {l.phone && <p className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /><a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}>{l.phone}</a></p>}
                  {l.email && <p className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden /><a href={`mailto:${l.email}`}>{l.email}</a></p>}
                </div>
              </article>
            ))}
          </div>
        )}
        {stats.length > 0 && (
          <section>
            <SectionHeading title="Maktab statistikasi" />
            <Stats items={stats} />
          </section>
        )}
      </Container>
    </>
  );
}
