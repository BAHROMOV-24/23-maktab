import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Kirish", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getSession()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  return (
    <main className="grid min-h-svh place-items-center bg-navy px-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-7 shadow-xl">
        <div className="space-y-2 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground"><GraduationCap className="size-7" aria-hidden /></span>
          <h1 className="text-2xl font-bold">Admin panelga kirish</h1>
          <p className="text-sm text-muted-foreground">23-maktab veb-sayti</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
