import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...rest }: Props) {
  const base = "w-full rounded-2xl border-0 bg-neutral-50 px-4 py-3 text-sm text-brand-dark placeholder-neutral-400 focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all duration-300";
  const cls = base + (className ? " " + className : "");
  return <input className={cls} {...rest} />;
}

