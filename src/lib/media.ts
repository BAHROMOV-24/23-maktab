const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** public-media bucketidagi fayl uchun ommaviy URL. */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  return `${base}/storage/v1/object/public/public-media/${path}`;
}
