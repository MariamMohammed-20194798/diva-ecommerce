"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { restoreSession } from "@/lib/auth-session";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const completeLogin = async () => {
      const restored = await restoreSession({ forceRefresh: true });
      if (restored) {
        router.replace("/");
        return;
      }
      setError("Unable to complete sign-in. Please try again.");
    };

    void completeLogin();
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <p className="text-sm text-muted-foreground">
        {error ?? "Signing you in..."}
      </p>
    </main>
  );
}
