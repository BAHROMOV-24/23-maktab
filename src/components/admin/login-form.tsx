"use client";

import { useFormSubmit } from "@/lib/use-form-submit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ next }: { next: string }) {
  const { state, pending, onSubmit } = useFormSubmit<LoginState>(login.bind(null, next), {});
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="username" required /></div>
      <div className="space-y-1.5"><Label htmlFor="password">Parol</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>{pending ? "Kirilmoqda..." : "Kirish"}</Button>
    </form>
  );
}
