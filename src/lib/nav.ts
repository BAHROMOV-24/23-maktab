import { t } from "@/lib/i18n";

export type NavItem = { label: string; href?: string; children?: { label: string; href: string }[] };

export const NAV: NavItem[] = [
  { label: t.nav.home, href: "/" },
  { label: t.nav.about, href: "/maktab-haqida" },
  {
    label: t.nav.staff,
    children: [
      { label: t.nav.leaders, href: "/rahbarlar" },
      { label: t.nav.teachers, href: "/oqituvchilar" },
    ],
  },
  {
    label: t.nav.council,
    children: [
      { label: "Kengash tarkibi", href: "/kengash" },
      { label: t.nav.activity, href: "/koordinatorlar" },
    ],
  },
  { label: t.nav.events, href: "/tadbirlar" },
  {
    label: t.nav.clubs,
    children: [
      { label: t.nav.clubsInternal, href: "/togaraklar/ichki" },
      { label: "Tashqi to'garaklar (\"Kelajak\" markazi)", href: "/togaraklar/tashqi" },
      { label: t.nav.registry, href: "/togaraklar/reyestr" },
    ],
  },
  { label: t.nav.announcements, href: "/elonlar" },
  { label: t.nav.contact, href: "/aloqa" },
];
