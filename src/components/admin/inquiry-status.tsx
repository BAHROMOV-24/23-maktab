"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setInquiryStatus } from "@/lib/admin/inquiry-actions";

const LABEL = { yangi: "Yangi", korib_chiqilmoqda: "Ko'rib chiqilmoqda", javob_berildi: "Javob berildi" } as const;
const COLOR = { yangi: "bg-red-100 text-red-900", korib_chiqilmoqda: "bg-amber-100 text-amber-900", javob_berildi: "bg-green-100 text-green-900" } as const;

export function InquiryStatus({ id, status }: { id: string; status: keyof typeof LABEL }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  return (
    <select aria-label="Holatini o'zgartirish" value={value} disabled={pending}
      className={`h-8 rounded-full border-0 px-3 text-xs font-medium ${COLOR[value]}`}
      onChange={(e) => {
        const next = e.target.value as keyof typeof LABEL;
        setValue(next);
        start(async () => { const r = await setInquiryStatus(id, next); if (r.error) { toast.error(r.error); setValue(status); } else toast.success("Holat yangilandi"); });
      }}>
      {Object.entries(LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
