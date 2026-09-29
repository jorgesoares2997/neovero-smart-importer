"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, initialize } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neovero-neutral-50">
        <Loader2 className="w-10 h-10 animate-spin text-neovero-blue" />
      </div>
    );
  }

  // Se não estiver logado e a rota não for /login, não renderiza o children (evita piscar o layout antes do redirect)
  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
