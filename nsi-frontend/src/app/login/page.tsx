"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Bot, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, initialize } = useAuthStore();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }
      
      // Zustand store will automatically detect the auth state change
    } catch (err: any) {
      setError(err.message || "Falha ao realizar login. Verifique suas credenciais.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neovero-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 border border-neovero-neutral-200">
        <div className="text-center mb-8">
          <div className="bg-neovero-blue-soft w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neovero-blue">
            <Bot size={32} />
          </div>
          <h1 className="text-2xl font-display font-bold text-neovero-blue">Smart Importer</h1>
          <p className="text-sm text-neovero-neutral-800 mt-2">Faça login para acessar a plataforma.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neovero-blue" htmlFor="email">E-mail corporativo</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neovero-neutral-200 focus:outline-none focus:ring-2 focus:ring-neovero-blue/30 focus:border-neovero-blue transition-all"
              placeholder="seu.nome@empresa.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-neovero-blue" htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neovero-neutral-200 focus:outline-none focus:ring-2 focus:ring-neovero-blue/30 focus:border-neovero-blue transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-neovero-blue text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-neovero-blue-medium transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Entrar <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
