import type { Metadata } from "next";
import { AnnouncementItem } from "@/components/site/cards";
import { Container, EmptyState, PageHero } from "@/components/site/ui-bits";
import { getAnnouncements } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "E'lonlar", description: "Maktab e'lonlari: ota-onalar majlisi, dars jadvali o'zgarishi va boshqalar." };
export const revalidate = 300;

export default async function AnnouncementsPage() {
  const list = await getAnnouncements();
  return (
    <>
      <PageHero title="E'lonlar" />
      <Container className="max-w-3xl">
        {list.length ? <ul className="divide-y rounded-xl border bg-card p-5 shadow-sm">{list.map((a) => <AnnouncementItem key={a.id} a={a} />)}</ul> : <EmptyState text={t.empty.announcements} />}
      </Container>
    </>
  );
}
