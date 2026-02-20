import Link from "next/link";

type GoogleButtonProps = {
  next?: string;
  text?: string;
};

export default function GoogleButton({ next, text }: GoogleButtonProps) {
  const nextParam = encodeURIComponent(next || "/dashboard");
  return (
    <Link
      href={`/auth/oauth/google?next=${nextParam}`}
      className="inline-flex w-full items-center justify-center rounded-2xl border border-brand-primary px-6 py-3 text-sm font-medium text-brand-dark transition hover:bg-brand-secondary"
    >
      {text || "Sign in with Google"}
    </Link>
  );
}
