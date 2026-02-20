import { Suspense } from "react";
import AuthCard from "@/features/auth/components/AuthCard";
import LoginForm from "@/features/auth/components/LoginForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/authHelpers";

export default async function LoginPage() {
  await redirectIfAuthenticated("/dashboard");

  return (
    <AuthCard title="Login">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
