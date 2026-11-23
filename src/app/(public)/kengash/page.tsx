import type { Metadata } from "next";
import { MemberCard } from "@/components/site/member-card";
import { Container, EmptyState, PageHero } from "@/components/site/ui-bits";
import { getCouncil } from "@/lib/data";

export const metadata: Metadata = { title: "O'quvchilar kengashi", description: "Maktab o'quvchilar kengashi tarkibi: maslahatchi, lider va koordinatorlar." };
export const revalidate = 300;

export default async function CouncilPage() {
  const all = await getCouncil();
  const advisor = all.filter((m) => m.role === "maslahatchi");
  const leader = all.filter((m) => m.role === "lider");
  const coords = all.filter((m) => m.role === "koordinator");
  const line = <div aria-hidden className="mx-auto h-8 w-px bg-gradient-to-b from-gold to-primary/40" />;

  return (
    <>
      <PageHero title="O'quvchilar kengashi" subtitle="Maslahatchi, lider va 7 ta yo'nalish koordinatorlari" />
      <Container>
        {all.length === 0 ? <EmptyState text="Kengash tarkibi hozircha kiritilmagan" /> : (
          <div className="space-y-0">
            {advisor.length > 0 && <div className="mx-auto max-w-xs">{advisor.map((m) => <MemberCard key={m.id} m={m} featured />)}</div>}
            {advisor.length > 0 && leader.length > 0 && line}
            {leader.length > 0 && <div className="mx-auto max-w-xs">{leader.map((m) => <MemberCard key={m.id} m={m} featured />)}</div>}
            {coords.length > 0 && (
              <>
                {line}
                <div aria-hidden className="mx-auto hidden h-px w-[85%] bg-primary/30 lg:block" />
                <ul className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                  {coords.map((m) => <li key={m.id}><MemberCard m={m} /></li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </Container>
    </>
  );
}
