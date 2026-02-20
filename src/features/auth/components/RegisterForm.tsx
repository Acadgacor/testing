"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { useSearchParams } from "next/navigation";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import GoogleButton from "@/features/auth/components/GoogleButton";
import { registerAction } from "@/features/auth/actions";
import { safeDecode, toStr } from "@/lib/utils";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState(() => safeDecode(searchParams.get("error")));
  const [infoMsg] = useState(() => safeDecode(searchParams.get("info")));
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const next = toStr(searchParams.get("next")) || "/questionnaire";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = toStr(formData.get("password") as any);
    if (confirm && confirm !== password) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setErrorMsg("");
    startTransition(async () => {
      const res = await registerAction(formData);
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
          <label className="block text-sm font-medium text-brand-light">Full name</label>
          <Input name="full_name" placeholder="Your name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light">Email</label>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light">Password</label>
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-light">Confirm Password</label>
          <Input
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        {errorMsg ? <div className="rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{errorMsg}</div> : null}
        {infoMsg ? <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-900 ring-1 ring-emerald-100">{infoMsg}</div> : null}
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <div className="mt-6">
        <GoogleButton next={next} text="Continue with Google" />
      </div>
      <div className="mt-4 text-center text-sm text-brand-light">
        Already have an account? <Link href="/auth/login" className="text-brand-primary">Login</Link>
      </div>
    </>
  );
}
