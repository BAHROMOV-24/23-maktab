import type { Metadata } from "next";
import { RegistryChart } from "@/components/site/registry-chart";
import { Container, EmptyState, PageHero, SectionHeading } from "@/components/site/ui-bits";
import { getRegistryStats } from "@/lib/data";

export const metadata: Metadata = { title: "Reyestrdagi o'quvchilar", description: "Ijtimoiy himoyaga muhtoj oilalar farzandlarini to'garaklarga jalb qilish bo'yicha umumiy statistika." };
export const revalidate = 300;

export default async function RegistryPage() {
  const st = await getRegistryStats();
  const pct = st.total ? Math.round((st.involved / st.total) * 100) : 0;
  const cards = [
    { label: "Reyestrdagi o'quvchilar", value: st.total },
    { label: "To'garakka jalb qilingan", value: st.involved },
    { label: "Jalb qilish ulushi", value: `${pct}%` },
  ];
  return (
    <>
      <PageHero title="Reyestrdagi o'quvchilar" subtitle="To'garaklarga jalb qilish bo'yicha umumiy statistika" />
      <Container className="space-y-10">
        {st.total === 0 ? <EmptyState text="Statistika hozircha kiritilmagan" /> : (
          <>
            <dl className="grid gap-4 sm:grid-cols-3">
              {cards.map((c) => (
                <div key={c.label} className="rounded-xl bg-primary p-6 text-center text-primary-foreground shadow-sm">
                  <dd className="text-4xl font-extrabold text-gold">{c.value}</dd><dt className="mt-1 text-sm text-white/85">{c.label}</dt>
                </div>
              ))}
            </dl>
            {st.by_club.length > 0 && (
              <section>
                <SectionHeading title="To'garaklar kesimida taqsimot" />
                <div className="rounded-xl border bg-card p-4 shadow-sm"><RegistryChart data={st.by_club} /></div>
              </section>
            )}
            <p className="text-sm text-muted-foreground">Maxfiylik sababli o&apos;quvchilarning shaxsiy ma&apos;lumotlari saytda e&apos;lon qilinmaydi, faqat umumiy sonlar ko&apos;rsatiladi.</p>
          </>
        )}
      </Container>
    </>
  );
}
