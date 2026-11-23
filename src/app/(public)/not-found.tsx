import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center gap-4 px-4 py-24 text-center">
      <p className="text-7xl font-extrabold text-gold">404</p>
      <h1 className="text-2xl font-bold">{t.common.notFound}</h1>
      <p className="text-muted-foreground">Siz izlagan sahifa o&apos;chirilgan yoki manzil noto&apos;g&apos;ri kiritilgan.</p>
      <Button render={<Link href="/" />}>{t.common.backHome}</Button>
    </div>
  );
}
