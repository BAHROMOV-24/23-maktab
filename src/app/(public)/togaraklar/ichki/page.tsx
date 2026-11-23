import type { Metadata } from "next";
import { ClubCard } from "@/components/site/club-card";
import { Container, EmptyState, PageHero } from "@/components/site/ui-bits";
import { getClubs } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Ichki to'garaklar" };
export const revalidate = 300;

export default async function Page() {
  const clubs = await getClubs("ichki");
  return (
    <>
      <PageHero title="Ichki to'garaklar" subtitle="Maktabda darsdan keyin o'tiladigan to'garaklar" />
      <Container>
        {clubs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{clubs.map((c) => <ClubCard key={c.id} c={c} />)}</div> : <EmptyState text={t.empty.clubs} />}
      </Container>
    </>
  );
}
