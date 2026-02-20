import { Suspense } from "react";
import AuthCard from "@/features/auth/components/AuthCard";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/authHelpers";

export default async function RegisterPage() {
  await redirectIfAuthenticated("/dashboard");

  return (
    <AuthCard title="Register">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}

