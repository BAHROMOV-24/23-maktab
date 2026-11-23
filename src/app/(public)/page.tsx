import Image from "next/image";
import Link from "next/link";
import { CalendarDays, GraduationCap, Landmark, Phone, Puzzle, Users } from "lucide-react";
import { AnnouncementItem, EventCard, PostCard } from "@/components/site/cards";
import { HeroSlider, type Slide } from "@/components/site/hero-slider";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Stats, type Stat } from "@/components/site/stats";
import { Container, EmptyState, SectionHeading } from "@/components/site/ui-bits";
import { getAnnouncements, getEvents, getLatestPosts, getPartners, getSettings, getSlides } from "@/lib/data";
import { mediaUrl } from "@/lib/media";
import { t } from "@/lib/i18n";

export const revalidate = 300;

const QUICK = [
  { href: "/rahbarlar", label: "Rahbarlar", Icon: Users },
  { href: "/oqituvchilar", label: "O'qituvchilar", Icon: GraduationCap },
  { href: "/kengash", label: "O'quvchilar kengashi", Icon: Landmark },
  { href: "/togaraklar/ichki", label: "To'garaklar", Icon: Puzzle },
  { href: "/tadbirlar", label: "Tadbirlar", Icon: CalendarDays },
  { href: "/aloqa", label: "Aloqa", Icon: Phone },
];

export default async function HomePage() {
  const [s, slidesDb, partners, posts, announcements, events] = await Promise.all([
    getSettings(), getSlides(), getPartners(), getLatestPosts(3), getAnnouncements(3), getEvents(),
  ]);

  const slides: Slide[] = [
    { image: mediaUrl(s.hero_path), title: s.school_name, subtitle: s.tagline, main: true },
    ...slidesDb.map((x) => ({ image: mediaUrl(x.image_path), title: x.title ?? "", href: x.link_url })),
  ];

  const stats: Stat[] = [
    s.student_count && { label: "O'quvchilar", value: s.student_count },
    s.teacher_count && { label: "O'qituvchilar", value: s.teacher_count },
    s.class_count && { label: "Sinflar", value: s.class_count },
    s.club_count && { label: "To'garaklar", value: s.club_count },
    s.founded_year && { label: "Tashkil topgan yil", value: s.founded_year, plain: true },
  ].filter(Boolean) as Stat[];

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.event_date >= today).slice(0, 3);

  return (
    <>
      <HeroSlider slides={slides} />

      <Container className="!pb-0">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link href={href} className="flex h-full flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary"><Icon className="size-6" aria-hidden /></span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      {stats.length > 0 && <Container className="!pb-0"><Stats items={stats} /></Container>}

      <Container className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <section aria-labelledby="news-h">
          <div id="news-h"><SectionHeading title="So'nggi yangiliklar" href="/koordinatorlar" /></div>
          {posts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
          ) : <EmptyState text={t.empty.news} />}
        </section>
        <section aria-labelledby="ann-h">
          <div id="ann-h"><SectionHeading title="E'lonlar" href="/elonlar" /></div>
          {announcements.length ? (
            <ul className="divide-y rounded-xl border bg-card p-4 shadow-sm">{announcements.map((a) => <AnnouncementItem key={a.id} a={a} />)}</ul>
          ) : <EmptyState text={t.empty.announcements} />}
        </section>
      </Container>

      <section className="bg-secondary/60">
        <Container>
          <SectionHeading title="Yaqinlashib kelayotgan tadbirlar" href="/tadbirlar" />
          {upcoming.length ? (
            <div className="grid gap-4 md:grid-cols-3">{upcoming.map((e) => <div key={e.id} className="relative"><EventCard event={e} /></div>)}</div>
          ) : <EmptyState text={t.empty.events} />}
        </Container>
      </section>

      <Container>
        <SectionHeading title="To'garaklar" href="/togaraklar/ichki" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/togaraklar/ichki", title: "Ichki to'garaklar", text: "Darsdan keyin maktabda o'tiladigan to'garaklar" },
            { href: "/togaraklar/tashqi", title: "\"Kelajak\" markazi", text: "Tashqi to'garaklar va ularga qatnayotgan o'quvchilar" },
            { href: "/togaraklar/reyestr", title: "Reyestrdagi o'quvchilar", text: "To'garaklarga jalb qilish bo'yicha umumiy statistika" },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <h3 className="text-lg font-semibold text-primary">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
            </Link>
          ))}
        </div>
      </Container>

      <section className="bg-navy text-white">
        <Container className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{t.inquiry.title}</h2>
            <p className="mt-3 max-w-md text-white/75">Savol, taklif yoki shikoyatingiz bo&apos;lsa, to&apos;g&apos;ridan-to&apos;g&apos;ri maktab direktoriga yo&apos;llang.</p>
          </div>
          <div className="rounded-xl bg-card p-5 text-card-foreground"><InquiryForm /></div>
        </Container>
      </section>

      {partners.length > 0 && (
        <Container>
          <SectionHeading title="Hamkorlar" />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {partners.map((p) => {
              const logo = mediaUrl(p.logo_path);
              const inner = (
                <>
                  {logo ? <Image src={logo} alt={p.name} width={120} height={60} loading="lazy" className="h-14 w-auto object-contain" /> : null}
                  <span className="mt-2 text-xs text-muted-foreground">{p.name}</span>
                </>
              );
              return (
                <li key={p.id} className="grid place-items-center rounded-xl border bg-card p-4 text-center">
                  {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="grid place-items-center">{inner}</a> : inner}
                </li>
              );
            })}
          </ul>
        </Container>
      )}
    </>
  );
}
