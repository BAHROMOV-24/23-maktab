"use client";

import { useFormSubmit } from "@/lib/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveAbout, type AboutState } from "@/lib/admin/about-actions";
import { RichTextEditor } from "./rich-text-editor";

const DEFAULT_TITLES: Record<string, string> = { tarix: "Maktab tarixi", maqsad: "Maqsadimiz", yutuqlar: "Yutuqlarimiz" };

export function AboutForm({ sections }: { sections: { key: string; title: string; body: string }[] }) {
  const { state, pending, onSubmit } = useFormSubmit<AboutState>(saveAbout, {});
  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
      {["tarix", "maqsad", "yutuqlar"].map((key) => {
        const s = sections.find((x) => x.key === key);
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={`${key}_title`}>Bo&apos;lim sarlavhasi</Label>
            <Input id={`${key}_title`} name={`${key}_title`} defaultValue={s?.title ?? DEFAULT_TITLES[key]} required />
            <RichTextEditor name={`${key}_body`} defaultValue={s?.body ?? ""} />
          </div>
        );
      })}
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-green-700">Saqlandi.</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saqlanmoqda..." : "Saqlash"}</Button>
    </form>
  );
}
