"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/shared/lib/supabaseClient";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";

export default function ResetPage() {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErrorMsg(error.message);
    else setOk(true);
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-dark">Reset Password</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-light">New password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {errorMsg ? <div className="rounded-2xl bg-brand-secondary px-4 py-2 text-sm text-brand-dark ring-1 ring-black/5">{errorMsg}</div> : null}
            <Button className="w-full" type="submit">Update password</Button>
            {ok ? <div className="text-xs text-brand-light">Password updated. You can close this page.</div> : null}
          </form>
        </div>
      </div>
    </section>
  );
}

