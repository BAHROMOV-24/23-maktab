import type { Metadata } from "next";
import { Gallery } from "@/components/site/gallery";
import { Container, PageHero, SectionHeading } from "@/components/site/ui-bits";
import { getAbout, getSettings } from "@/lib/data";
import { safeHtml } from "@/lib/format";
import { mediaUrl } from "@/lib/media";

export const metadata: Metadata = { title: "Maktab haqida", description: "Maktabning tarixi, maqsadi, yutuqlari va fotogalereyasi." };
export const revalidate = 300;

const ORDER = ["tarix", "maqsad", "yutuqlar"];

export default async function AboutPage() {
  const [{ sections, gallery }, s] = await Promise.all([getAbout(), getSettings()]);
  const sorted = [...sections].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key)).filter((x) => x.body.trim());
  return (
    <>
      <PageHero title="Maktab haqida" subtitle={s.about_short ?? undefined} />
      <Container className="space-y-12">
        {sorted.length === 0 && <p className="text-muted-foreground">Ma&apos;lumot tez orada joylanadi.</p>}
        {sorted.map((sec) => (
          <section key={sec.key}>
            <SectionHeading title={sec.title} />
            <div className="prose-school max-w-3xl" dangerouslySetInnerHTML={{ __html: safeHtml(sec.body) }} />
          </section>
        ))}
        {gallery.length > 0 && (
          <section>
            <SectionHeading title="Fotogalereya" />
            <Gallery images={gallery.map((g) => ({ src: mediaUrl(g.path)!, thumb: mediaUrl(g.thumb_path ?? g.path)!, alt: g.caption ?? "Maktab fotosurati" }))} />
          </section>
        )}
      </Container>
    </>
  );
}
