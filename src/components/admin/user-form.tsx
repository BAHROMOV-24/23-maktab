"use client";

import { useFormSubmit } from "@/lib/use-form-submit";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser, updateUser, type UserState } from "@/lib/admin/user-actions";
import { t } from "@/lib/i18n";

type U = { id: string; full_name: string; role: string; council_member_id: string | null; blocked: boolean; email?: string };

export function UserForm({ user, council, isSelf }: { user: U | null; council: { value: string; label: string }[]; isSelf?: boolean }) {
  const action = user ? updateUser.bind(null, user.id) : createUser;
  const { state, pending, onSubmit } = useFormSubmit<UserState>(action, {});
  const fe = state.fieldErrors ?? {};
  const sel = "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm";
  const err = (n: string) => fe[n] && <p className="text-sm text-destructive">{fe[n]}</p>;
  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-5 shadow-sm sm:p-6" noValidate>
      <div className="space-y-1.5"><Label htmlFor="full_name">Ism-familiya</Label><Input id="full_name" name="full_name" defaultValue={user?.full_name} />{err("full_name")}</div>
      {user ? <p className="text-sm text-muted-foreground">Email: <b>{user.email}</b></p> : (
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="off" />{err("email")}</div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">{user ? "Yangi parol (o'zgartirmoqchi bo'lsangiz)" : "Parol"}</Label>
        <Input id="password" name="password" type="text" autoComplete="new-password" placeholder="Kamida 10 ta belgi" />{err("password")}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Roli</Label>
        <select id="role" name="role" defaultValue={user?.role ?? "koordinator"} className={sel} disabled={isSelf}>
          {(["superadmin", "admin", "maslahatchi", "koordinator"] as const).map((r) => <option key={r} value={r}>{t.roles[r]}</option>)}
        </select>
        {isSelf && <input type="hidden" name="role" value="superadmin" />}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="council_member_id">Kengashdagi o&apos;rni (koordinator va lider uchun majburiy)</Label>
        <select id="council_member_id" name="council_member_id" defaultValue={user?.council_member_id ?? ""} className={sel}>
          <option value="">— bog&apos;lanmagan —</option>
          {council.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>{err("council_member_id")}
      </div>
      {user && !isSelf && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="blocked" defaultChecked={user.blocked} className="size-4" />Bloklangan (tizimga kira olmaydi)</label>}
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Saqlanmoqda..." : user ? "Saqlash" : "Foydalanuvchi yaratish"}</Button>
        <Button type="button" variant="outline" render={<Link href="/admin/foydalanuvchilar" />}>Bekor qilish</Button>
      </div>
    </form>
  );
}
