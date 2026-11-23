import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { mediaUrl } from "@/lib/media";

export function Logo({ url, size = 40 }: { url: string | null; size?: number }) {
  const src = mediaUrl(url);
  return src ? (
    <Image src={src} alt="" width={size} height={size} className="rounded-full object-contain" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center rounded-full bg-primary text-primary-foreground" style={{ width: size, height: size }}>
      <GraduationCap className="size-5" aria-hidden />
    </span>
  );
}
