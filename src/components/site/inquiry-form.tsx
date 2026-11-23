"use client";

import { useFormSubmit } from "@/lib/use-form-submit";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry, type InquiryState } from "@/app/(public)/aloqa/actions";
import { t } from "@/lib/i18n";

export function InquiryForm() {
  const { state, pending, onSubmit } = useFormSubmit<InquiryState>(submitInquiry, {});
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-green-600/30 bg-green-50 p-5 text-green-900">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden /> <p>{t.inquiry.sent}</p>
      </div>
    );
  }

  const field = (id: string, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} required aria-invalid={!!fe[id]} aria-describedby={fe[id] ? `${id}-err` : undefined} {...props} />
      {fe[id] && <p id={`${id}-err`} className="text-sm text-destructive">{fe[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", t.inquiry.name, { autoComplete: "name" })}
        {field("phone", t.inquiry.phone, { type: "tel", autoComplete: "tel", placeholder: "+998 90 123 45 67" })}
      </div>
      {field("subject", t.inquiry.subject)}
      <div className="space-y-1.5">
        <Label htmlFor="message">{t.inquiry.message}</Label>
        <Textarea id="message" name="message" rows={5} required aria-invalid={!!fe.message} />
        {fe.message && <p className="text-sm text-destructive">{fe.message}</p>}
      </div>
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Veb-sayt <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="lg" disabled={pending}>{pending ? t.common.loading : t.inquiry.send}</Button>
    </form>
  );
}
