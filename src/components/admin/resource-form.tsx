"use client";

import { useState } from "react";
import { useFormSubmit } from "@/lib/use-form-submit";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveResource, type FormState } from "@/lib/admin/actions";
import type { Field, Resource } from "@/lib/admin/resources";
import { FilesField } from "./files-field";
import { GalleryField } from "./gallery-field";
import { ImageField } from "./image-field";
import { RichTextEditor } from "./rich-text-editor";
import { ScheduleField } from "./schedule-field";

type Row = Record<string, unknown>;
const selectCls = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";

export function ResourceForm({ resource, id, values, relations, backHref }: {
  resource: Resource; id: string | null; values: Row; relations: Record<string, { value: string; label: string }[]>; backHref: string;
}) {
  const { state, pending, onSubmit } = useFormSubmit<FormState>(saveResource.bind(null, resource.slug, id), {});
  const [live, setLive] = useState<Row>(values); // showIf uchun
  const fe = state.fieldErrors ?? {};

  function control(f: Field) {
    const v = values[f.name];
    const common = { id: f.name, name: f.name, "aria-invalid": !!fe[f.name], "aria-describedby": fe[f.name] ? `${f.name}-err` : undefined };
    switch (f.type) {
      case "textarea": return <Textarea {...common} rows={4} defaultValue={(v as string) ?? ""} />;
      case "richtext": return <RichTextEditor name={f.name} defaultValue={(v as string) ?? ""} invalid={!!fe[f.name]} />;
      case "number": return <Input {...common} type="number" min={0} inputMode="numeric" defaultValue={(v as number | null) ?? ""} />;
      case "date": return <Input {...common} type="date" defaultValue={(v as string) ?? ""} />;
      case "checkbox": return (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={f.name} defaultChecked={!!v} className="size-4 accent-[var(--primary)]" />Ha</label>
      );
      case "select": return (
        <select {...common} className={selectCls} defaultValue={(v as string) ?? ""} onChange={(e) => setLive((l) => ({ ...l, [f.name]: e.target.value }))}>
          {!f.required && <option value="">—</option>}
          {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      case "relation": return (
        <select {...common} className={selectCls} defaultValue={(v as string) ?? ""}>
          <option value="">— tanlanmagan —</option>
          {(relations[f.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      case "image": return (
        <ImageField name={f.name} thumbName={f.thumbName} label={f.label} invalid={!!fe[f.name]} folder={resource.folder}
          defaultPath={values[f.name] as string | null} defaultThumb={f.thumbName ? (values[f.thumbName] as string | null) : null} />
      );
      case "schedule": return <ScheduleField name={f.name} defaultValue={v} />;
      case "gallery": return <GalleryField name={f.name} folder={resource.folder} defaultItems={(Array.isArray(v) ? v : []).map((x: Row) => ({ path: x.path as string, thumb_path: (x.thumb_path as string) ?? null, alt: (x.alt as string) ?? null }))} />;
      case "files": return <FilesField name={f.name} folder={resource.folder} defaultItems={(Array.isArray(v) ? v : []) as never[]} />;
      default: return <Input {...common} defaultValue={(v as string) ?? ""} />;
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6" noValidate>
      {resource.fields.map((f) => {
        if (f.showIf && String((live[f.showIf.field] ?? values[f.showIf.field]) ?? "") !== f.showIf.value) return null;
        const heading = f.section ?? null;
        return (
          <div key={f.name} className="space-y-1.5">
            {heading && <h2 className="border-b pb-1 pt-3 text-base font-semibold text-primary">{heading}</h2>}
            <Label htmlFor={f.name}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
            {control(f)}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
            {fe[f.name] && <p id={`${f.name}-err`} className="text-sm text-destructive">{fe[f.name]}</p>}
          </div>
        );
      })}
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-2 rounded-b-xl border-t bg-card/95 p-4 backdrop-blur sm:-mx-6 sm:-mb-6">
        <Button type="submit" disabled={pending}>{pending ? "Saqlanmoqda..." : "Saqlash"}</Button>
        <Button type="button" variant="outline" render={<Link href={backHref} />}>Bekor qilish</Button>
      </div>
    </form>
  );
}
