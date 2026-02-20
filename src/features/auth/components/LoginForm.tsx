"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import GoogleButton from "@/features/auth/components/GoogleButton";
import { loginAction } from "@/features/auth/actions";
import { safeDecode, toStr } from "@/lib/utils";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState(() => safeDecode(searchParams.get("error")));
  const [isPending, startTransition] = useTransition();
  const next = toStr(searchParams.get("next")) || "/dashboard";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setErrorMsg("");
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      }
    });
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm font-medium text-brand-light">Email</label>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light">Password</label>
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        {errorMsg ? <div className="rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{errorMsg}</div> : null}
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Logging in…" : "Login"}
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-xs text-brand-light">
        <Link href="/auth/forgot">Forgot password?</Link>
        <Link href="/auth/register">Create account</Link>
      </div>
      <div className="mt-6">
        <GoogleButton next={next} />
      </div>
    </>
  );
}
