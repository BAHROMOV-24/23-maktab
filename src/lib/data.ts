import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/database.types";

type T = Database["public"]["Tables"];
export type Settings = T["site_settings"]["Row"];
export type CouncilMember = T["council_members"]["Row"];
export type Post = T["posts"]["Row"];
export type PostWithAuthor = Post & { author: Pick<CouncilMember, "id" | "first_name" | "last_name" | "slug" | "role"> | null };
export type Club = T["clubs"]["Row"];
export type Teacher = T["teachers"]["Row"];
export type Leader = T["leaders"]["Row"];
export type EventRow = T["events"]["Row"];
export type Announcement = T["announcements"]["Row"];

const sb = () => createPublicClient();
const AUTHOR = "author:council_members!posts_author_id_fkey(id,first_name,last_name,slug,role)";

export const getSettings = cache(async (): Promise<Settings> => {
  const { data } = await sb().from("site_settings").select("*").eq("id", 1).single();
  return (data ?? ({ id: 1, school_name: "23-maktab", require_approval: true } as unknown as Settings));
});

export const getSlides = cache(async () => {
  const { data } = await sb().from("hero_slides").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});

export const getPartners = cache(async () => {
  const { data } = await sb().from("partners").select("*").order("sort_order");
  return data ?? [];
});

export const getLatestPosts = cache(async (limit = 3): Promise<PostWithAuthor[]> => {
  const { data } = await sb().from("posts").select(`*, ${AUTHOR}`)
    .eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  return (data ?? []) as unknown as PostWithAuthor[];
});

export async function getPostsPage(page: number, authorId: string | null, perPage = 9) {
  let q = sb().from("posts").select(`*, ${AUTHOR}`, { count: "exact" }).eq("status", "published");
  if (authorId) q = q.eq("author_id", authorId);
  const from = (page - 1) * perPage;
  const { data, count } = await q.order("published_at", { ascending: false }).range(from, from + perPage - 1);
  return { posts: (data ?? []) as unknown as PostWithAuthor[], total: count ?? 0, perPage };
}

export const getPostBySlug = cache(async (slug: string) => {
  const { data } = await sb().from("posts")
    .select(`*, ${AUTHOR}, post_images(*), post_files(*)`).eq("slug", slug).eq("status", "published").maybeSingle();
  return data as unknown as (PostWithAuthor & { post_images: T["post_images"]["Row"][]; post_files: T["post_files"]["Row"][] }) | null;
});

export const getAnnouncements = cache(async (limit?: number) => {
  let q = sb().from("announcements").select("*").eq("is_published", true).order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return data ?? [];
});

export const getAnnouncement = cache(async (id: string) => {
  const { data } = await sb().from("announcements").select("*").eq("id", id).eq("is_published", true).maybeSingle();
  return data;
});

export const getEvents = cache(async () => {
  const { data } = await sb().from("events").select("*").eq("is_published", true).order("event_date", { ascending: true });
  return data ?? [];
});

export const getEventBySlug = cache(async (slug: string) => {
  const { data } = await sb().from("events").select("*, event_images(*), event_files(*)")
    .eq("slug", slug).eq("is_published", true).maybeSingle();
  return data;
});

export const getCouncil = cache(async (): Promise<CouncilMember[]> => {
  const { data } = await sb().from("council_members").select("*").eq("is_active", true).order("sort_order");
  return data ?? [];
});

export const getCouncilBySlug = cache(async (slug: string) => {
  const { data } = await sb().from("council_members").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  return data;
});

export const getLeaders = cache(async () => {
  const { data } = await sb().from("leaders").select("*").order("sort_order");
  return data ?? [];
});

export const getTeachers = cache(async () => {
  const { data } = await sb().from("teachers").select("*").order("sort_order").order("full_name");
  return data ?? [];
});

export const getTeacher = cache(async (id: string) => {
  const { data } = await sb().from("teachers").select("*").eq("id", id).maybeSingle();
  return data;
});

export const getClubs = cache(async (type: "ichki" | "tashqi") => {
  const { data } = await sb().from("clubs").select("*").eq("type", type).order("sort_order");
  return data ?? [];
});

export const getAbout = cache(async () => {
  const [{ data: sections }, { data: gallery }] = await Promise.all([
    sb().from("about_sections").select("*"),
    sb().from("gallery_images").select("*").order("sort_order"),
  ]);
  return { sections: sections ?? [], gallery: gallery ?? [] };
});

export type RegistryStats = { total: number; involved: number; by_club: { club: string; count: number }[] };
export const getRegistryStats = cache(async (): Promise<RegistryStats> => {
  const { data } = await sb().rpc("registry_stats");
  return (data as unknown as RegistryStats) ?? { total: 0, involved: 0, by_club: [] };
});

export type NotificationItem = { id: string; kind: "post" | "event"; title: string; href: string; at: string };

/** Qo'ng'iroqcha uchun so'nggi postlar va tadbirlar (ommaviy sahifa keshi bilan birga yangilanadi). */
export const getNotifications = cache(async (): Promise<NotificationItem[]> => {
  const [{ data: posts }, { data: events }] = await Promise.all([
    sb().from("posts").select("id,title,slug,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(8),
    sb().from("events").select("id,title,slug,published_at").eq("is_published", true).order("published_at", { ascending: false }).limit(5),
  ]);
  const items: NotificationItem[] = [
    ...(posts ?? []).map((p) => ({ id: p.id, kind: "post" as const, title: p.title, href: `/yangiliklar/${p.slug}`, at: p.published_at ?? "" })),
    ...(events ?? []).map((e) => ({ id: e.id, kind: "event" as const, title: e.title, href: `/tadbirlar/${e.slug}`, at: e.published_at })),
  ];
  return items.filter((i) => i.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
});
