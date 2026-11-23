import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, description, addHref, addLabel = "Qo'shish", children }: { title: string; description?: string; addHref?: string; addLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex gap-2">
        {children}
        {addHref && <Button render={<Link href={addHref} />}><Plus aria-hidden /> {addLabel}</Button>}
      </div>
    </div>
  );
}
