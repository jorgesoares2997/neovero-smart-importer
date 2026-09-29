"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, CheckCircle, Clock, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalRowsProcessed: number;
  totalImports: number;
  completedImports: number;
  pendingImports: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/analytics`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full bg-neovero-neutral-50 min-h-full">
      <header className="w-full bg-white border-b border-neovero-neutral-200 px-4 md:px-10 py-6 md:py-8 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-neovero-blue-soft rounded-xl shadow-sm border border-neovero-neutral-200">
            <BarChart3 className="w-6 h-6 text-neovero-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-neovero-blue">Analytics NSI</h1>
            <p className="text-sm text-neovero-neutral-800 mt-1">Visão geral do volume processado pela Inteligência Artificial.</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-10">
        {loading ? (
          <div className="text-center py-16 text-neovero-neutral-800 animate-pulse font-medium">
            Carregando métricas...
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-neovero-neutral-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neovero-neutral-600 uppercase tracking-wider">Planilhas Recebidas</span>
                <div className="w-10 h-10 rounded-full bg-neovero-blue-soft flex items-center justify-center text-neovero-blue">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-display font-black text-neovero-blue">{data.totalImports}</div>
                <div className="text-sm text-emerald-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" /> Importações registradas
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-neovero-neutral-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neovero-neutral-600 uppercase tracking-wider">Equipamentos Mapeados</span>
                <div className="w-10 h-10 rounded-full bg-neovero-orange/10 flex items-center justify-center text-neovero-orange">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-display font-black text-neovero-neutral-800">{data.totalRowsProcessed.toLocaleString('pt-BR')}</div>
                <div className="text-sm text-neovero-neutral-600 font-medium mt-1">
                  Linhas lidas e sanitizadas
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-neovero-neutral-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neovero-neutral-600 uppercase tracking-wider">Status Concluído</span>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-display font-black text-neovero-neutral-800">{data.completedImports}</div>
                <div className="text-sm text-neovero-neutral-600 font-medium mt-1">
                  Planilhas finalizadas
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-card border border-neovero-neutral-200 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-neovero-neutral-600 uppercase tracking-wider">Requerem Revisão</span>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-display font-black text-neovero-neutral-800">{data.pendingImports}</div>
                <div className="text-sm text-neovero-neutral-600 font-medium mt-1">
                  Planilhas pendentes
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-red-500 font-medium">
            Erro ao carregar dados.
          </div>
        )}
        
        <div className="mt-8">
           <Link href="/history" className="inline-flex items-center gap-2 text-neovero-blue font-bold hover:underline">
              Ver Histórico Completo <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </main>
    </div>
  );
}
