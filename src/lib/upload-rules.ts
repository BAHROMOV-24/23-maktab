/** Yuklash qoidalari: brauzer va server bir xil qoidalarni ishlatadi. */
export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SRC = 10 * 1024 * 1024; // siqishdan oldin
export const MAX_IMAGE_OUT = 2 * 1024 * 1024; // siqilgan rasm uchun server chegarasi
export const MAX_FILE = 15 * 1024 * 1024;
export const TARGET_MAIN_MB = 0.3; // ~300 KB
export const TARGET_THUMB_MB = 0.05;

export const FILE_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};
export const FILE_ACCEPT = Object.keys(FILE_TYPES).map((e) => "." + e).join(",");

export type Bucket = "public-media" | "private";
export const FOLDERS = ["people", "clubs", "events", "partners", "slides", "gallery", "site", "posts", "registry"] as const;
export type Folder = (typeof FOLDERS)[number];

/** Qaysi rol qaysi papkaga yuklay oladi. */
export function allowedFolders(role: string, bucket: Bucket): Folder[] {
  if (bucket === "private") return ["superadmin", "admin"].includes(role) ? ["registry"] : [];
  if (["superadmin", "admin"].includes(role)) return ["people", "clubs", "events", "partners", "slides", "gallery", "site", "posts"];
  if (role === "maslahatchi") return ["people", "posts"];
  if (role === "koordinator") return ["posts"];
  return [];
}

export const PATH_RE = /^(people|clubs|events|partners|slides|gallery|site|posts|registry)\/\d{4}\/[0-9a-f-]{36}\.(webp|pdf|docx|pptx|xlsx)$/;

export function extOf(name: string): string {
  return (name.split(".").pop() ?? "").toLowerCase();
}

export function checkFileName(name: string, size: number): string | null {
  const ext = extOf(name);
  if (!FILE_TYPES[ext]) return "Faqat PDF, DOCX, PPTX va XLSX fayllar ruxsat etiladi";
  if (size > MAX_FILE) return "Fayl hajmi 15 MB dan oshmasligi kerak";
  if (size === 0) return "Fayl bo'sh";
  return null;
}

export function checkImageFile(file: { type: string; size: number; name: string }): string | null {
  const ext = extOf(file.name);
  if (!IMAGE_MIME.includes(file.type) || !["jpg", "jpeg", "png", "webp"].includes(ext)) return "Faqat JPG, PNG yoki WebP rasm yuklang";
  if (file.size > MAX_IMAGE_SRC) return "Rasm hajmi 10 MB dan oshmasligi kerak";
  return null;
}
