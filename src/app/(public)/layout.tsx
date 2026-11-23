import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { NotificationBell } from "@/components/site/notification-bell";
import { TopBar } from "@/components/site/top-bar";
import { getNotifications, getSettings } from "@/lib/data";
import { t } from "@/lib/i18n";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [s, notifications] = await Promise.all([getSettings(), getNotifications()]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        {t.site.skipToContent}
      </a>
      <TopBar s={s} />
      <Header name={s.school_name} logoUrl={s.logo_path} bell={<NotificationBell initial={notifications} />} />
      <main id="main" className="flex-1">{children}</main>
      <Footer s={s} />
    </>
  );
}
