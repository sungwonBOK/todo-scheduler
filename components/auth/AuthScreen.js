"use client";

import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard.jsx";
import AuthForm from "./AuthForm.js";
import AuthShell from "../layout/AuthShell.jsx";

export default function AuthScreen({ mode }) {
  const router = useRouter();

  return (
    <AuthShell>
      <AuthCard mode={mode}>
        <AuthForm mode={mode} onSuccess={() => router.push("/")} />
      </AuthCard>
    </AuthShell>
  );
}
