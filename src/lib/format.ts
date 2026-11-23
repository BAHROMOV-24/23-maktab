import sanitizeHtml from "sanitize-html";

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T00:00:00" : d) : d;
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatBytes(n: number | null | undefined): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
  return `${(n / 1024 ** 3).toFixed(1).replace(/\.0$/, "")} GB`;
}

export function fileKind(name: string, mime?: string | null): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext) return ext.toUpperCase();
  return mime?.split("/").pop()?.toUpperCase() ?? "FAYL";
}

/** Oxirgi 3 kun ichida e'lon qilingan bo'lsa "Yangi". */
export function isNew(date: string | null | undefined): boolean {
  if (!date) return false;
  return Date.now() - new Date(date).getTime() < 3 * 24 * 3600 * 1000;
}

export function stripHtml(html: string | null | undefined, max = 160): string {
  const text = (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

/** Boy matnni (Tiptap HTML) xavfsiz holga keltiradi. */
export function safeHtml(html: string | null | undefined): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "h2", "h3", "blockquote"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }) },
  });
}

export function fullName(m: { first_name: string; last_name: string }): string {
  return `${m.first_name} ${m.last_name}`.trim();
}

export function slugify(input: string): string {
  const map: Record<string, string> = { "oʻ": "o", "gʻ": "g", "o'": "o", "g'": "g", "ʻ": "", "’": "", "'": "" };
  let s = input.toLowerCase();
  for (const [k, v] of Object.entries(map)) s = s.split(k).join(v);
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "post";
}
