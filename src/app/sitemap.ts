import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sb = createPublicClient();
  const [posts, events, ann, teachers, council] = await Promise.all([
    sb.from("posts").select("slug,updated_at").eq("status", "published"),
    sb.from("events").select("slug,updated_at").eq("is_published", true),
    sb.from("announcements").select("id,updated_at").eq("is_published", true),
    sb.from("teachers").select("id,updated_at"),
    sb.from("council_members").select("slug,updated_at").eq("is_active", true).neq("role", "maslahatchi"),
  ]);
  const staticPaths = ["", "/maktab-haqida", "/rahbarlar", "/oqituvchilar", "/kengash", "/koordinatorlar", "/tadbirlar",
    "/togaraklar/ichki", "/togaraklar/tashqi", "/togaraklar/reyestr", "/elonlar", "/aloqa"];
  return [
    ...staticPaths.map((p) => ({ url: site + p, changeFrequency: "weekly" as const })),
    ...(posts.data ?? []).map((x) => ({ url: `${site}/yangiliklar/${x.slug}`, lastModified: x.updated_at })),
    ...(events.data ?? []).map((x) => ({ url: `${site}/tadbirlar/${x.slug}`, lastModified: x.updated_at })),
    ...(ann.data ?? []).map((x) => ({ url: `${site}/elonlar/${x.id}`, lastModified: x.updated_at })),
    ...(teachers.data ?? []).map((x) => ({ url: `${site}/oqituvchilar/${x.id}`, lastModified: x.updated_at })),
    ...(council.data ?? []).map((x) => ({ url: `${site}/koordinatorlar/${x.slug}`, lastModified: x.updated_at })),
  ];
}
