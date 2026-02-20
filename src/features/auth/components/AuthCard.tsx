import type { ReactNode } from "react";
import Card from "@/shared/ui/Card";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">{title}</h1>
          <p className="mt-2 text-sm text-brand-light">Welcome to Beaulytics</p>
        </div>
        <Card className="p-8 shadow-xl shadow-neutral-100 border-0">
          {children}
        </Card>
      </div>
    </section>
  );
}
