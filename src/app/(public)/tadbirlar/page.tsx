import type { Metadata } from "next";
import { EventCard } from "@/components/site/cards";
import { Container, EmptyState, PageHero, SectionHeading } from "@/components/site/ui-bits";
import { getEvents } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Tadbirlar", description: "Maktabda o'tkaziladigan va o'tgan tadbirlar." };
export const revalidate = 300;

export default async function EventsPage() {
  const events = await getEvents();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today);
  const past = events.filter((e) => e.event_date < today).reverse();
  return (
    <>
      <PageHero title="Tadbirlar" />
      <Container className="space-y-12">
        <section>
          <SectionHeading title="Yaqinlashib kelayotgan" />
          {upcoming.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((e) => <div key={e.id} className="relative"><EventCard event={e} /></div>)}</div> : <EmptyState text={t.empty.events} />}
        </section>
        <section>
          <SectionHeading title="O'tgan tadbirlar" />
          {past.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{past.map((e) => <div key={e.id} className="relative"><EventCard event={e} /></div>)}</div> : <EmptyState text="O'tgan tadbirlar yo'q" />}
        </section>
      </Container>
    </>
  );
}
