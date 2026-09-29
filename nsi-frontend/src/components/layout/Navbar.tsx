"use client";

import Link from "next/link";
import { UploadCloud, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function Navbar() {
  const { user, signOut } = useAuthStore();
  return (
    <header className="w-full bg-white border-b border-neovero-neutral-200 h-[80px] sticky top-0 z-50 flex items-center shadow-sm">
      <div className="max-w-[1500px] w-full mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-neovero-orange shrink-0" />
          <span className="font-display font-bold text-lg sm:text-xl text-neovero-blue tracking-wider hidden xs:block sm:block">SMART IMPORTER</span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-8">
          <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-neovero-neutral-800">
            <Link href="/" className="hover:text-neovero-blue transition-colors">Início</Link>
            <Link href="/history" className="hover:text-neovero-blue transition-colors">Histórico</Link>
            <Link href="/about" className="hover:text-neovero-blue transition-colors">Sobre o App</Link>
          </nav>
          
          <div className="hidden sm:flex items-center gap-4 border-l border-neovero-neutral-200 pl-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-neovero-neutral-800" title="Conectado ao Engine AI">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="hidden lg:block">Engine On</span>
            </div>
            <Link 
              href="/"
              className="bg-neovero-blue-medium hover:bg-neovero-blue text-white px-5 py-2.5 rounded text-xs tracking-wider font-semibold uppercase transition-colors"
            >
              Novo Processamento
            </Link>
            
            {user && (
              <div className="flex items-center gap-3 border-l border-neovero-neutral-200 pl-4 ml-2">
                <span className="hidden lg:block text-xs font-medium text-neovero-neutral-600 truncate max-w-[150px]" title={user.email}>
                  {user.email}
                </span>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neovero-neutral-600 hover:text-red-500 transition-colors uppercase tracking-wider"
                  title="Sair"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
