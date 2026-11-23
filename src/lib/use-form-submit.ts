"use client";

import { useActionState, useTransition, type FormEvent } from "react";

/**
 * Server action bilan ishlaydi, lekin xatolikda forma tozalanib ketmaydi
 * (React 19 `<form action>` har doim formani tozalaydi, foydalanuvchi yozganini yo'qotmasligi kerak).
 */
export function useFormSubmit<S extends object>(action: (prev: S, fd: FormData) => Promise<S>, initial: S) {
  const [state, run, pending] = useActionState<S, FormData>(action as unknown as (prev: Awaited<S>, fd: FormData) => Promise<Awaited<S>>, initial as Awaited<S>);
  const [transitioning, start] = useTransition();
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    start(() => run(fd));
  }
  return { state: state as S, pending: pending || transitioning, onSubmit };
}
