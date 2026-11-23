"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** O'chirishdan oldin tasdiqlash oynasi. `action` — bog'langan server action. */
export function DeleteButton({ action, name, iconOnly = true, }: { action: () => Promise<{ error?: string } | void>; name: string; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <Button type="button" variant="ghost" size={iconOnly ? "icon" : "default"} aria-label={`O'chirish: ${name}`} className="text-destructive hover:bg-destructive/10" onClick={() => setOpen(true)}>
        <Trash2 /> {!iconOnly && "O'chirish"}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O&apos;chirishni tasdiqlang</AlertDialogTitle>
            <AlertDialogDescription>«{name}» o&apos;chiriladi. Bu amalni qaytarib bo&apos;lmaydi, tegishli rasm va fayllar ham o&apos;chadi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <Button variant="destructive" disabled={pending} onClick={() => start(async () => {
              const r = await action();
              if (r && r.error) toast.error(r.error); else { toast.success("O'chirildi"); setOpen(false); router.refresh(); }
            })}>{pending ? "O'chirilmoqda..." : "Ha, o'chirish"}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
