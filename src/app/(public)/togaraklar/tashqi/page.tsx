import type { Metadata } from "next";
import { ClubCard } from "@/components/site/club-card";
import { Container, EmptyState, PageHero } from "@/components/site/ui-bits";
import { getClubs } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Kelajak markazi to'garaklari" };
export const revalidate = 300;

export default async function Page() {
  const clubs = await getClubs("tashqi");
  return (
    <>
      <PageHero title={"“Kelajak” markazi to'garaklari"} subtitle="Tashqi to'garaklar va ularga qatnayotgan maktab o'quvchilari" />
      <Container>
        {clubs.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{clubs.map((c) => <ClubCard key={c.id} c={c} />)}</div> : <EmptyState text={t.empty.clubs} />}
      </Container>
    </>
  );
}
