import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Container, PageHero } from "@/components/site/ui-bits";
import { getSettings } from "@/lib/data";
import { t } from "@/lib/i18n";

export const metadata: Metadata = { title: "Aloqa", description: "Maktab direktoriga murojaat yo'llash va aloqa ma'lumotlari." };
export const revalidate = 300;

export default async function ContactPage() {
  const s = await getSettings();
  const rows = [
    { Icon: MapPin, v: s.address }, { Icon: Phone, v: s.phone }, { Icon: Mail, v: s.email }, { Icon: Clock, v: s.work_hours },
  ].filter((r) => r.v);
  return (
    <>
      <PageHero title={t.inquiry.title} subtitle="Savol, taklif yoki shikoyatingizni yozing. Murojaatlar ko'rib chiqiladi." />
      <Container className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-7"><InquiryForm /></div>
        <aside className="space-y-4 text-sm">
          <h2 className="text-lg font-semibold">Aloqa ma&apos;lumotlari</h2>
          {rows.map(({ Icon, v }, i) => (
            <p key={i} className="flex gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />{v}</p>
          ))}
        </aside>
      </Container>
    </>
  );
}
