import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import AuthWrapper from "@/components/auth/AuthWrapper";

export const metadata: Metadata = {
  title: "Smart Importer",
  description: "CMMS/EAM Integral para Engenharia Clínica e Manutenção",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neovero-neutral-50 text-neovero-neutral-800 font-sans">
        <AuthWrapper>
          <Navbar />
          <main className="flex-1 w-full min-w-0 flex flex-col">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}
