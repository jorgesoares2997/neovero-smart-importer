import Link from "next/link";
import { FileQuestion, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-neovero-neutral-50 px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-neovero-orange blur-3xl opacity-20 rounded-full w-40 h-40 transform translate-x-1/2"></div>
        <div className="bg-white p-6 rounded-3xl shadow-card relative z-10 border border-neovero-neutral-200">
          <FileQuestion className="w-20 h-20 text-neovero-blue" strokeWidth={1.5} />
        </div>
      </div>
      
      <h1 className="text-8xl font-display font-black text-neovero-blue mb-2 tracking-tighter">
        404
      </h1>
      <h2 className="text-2xl font-bold text-neovero-neutral-800 mb-4">
        Página não encontrada
      </h2>
      <p className="text-neovero-neutral-600 max-w-md mx-auto mb-10 text-lg">
        Parece que a página que você tentou acessar não existe, foi movida ou você não tem permissão para visualizá-la.
      </p>
      
      <Link 
        href="/"
        className="group bg-neovero-blue hover:bg-neovero-blue-dark text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-3 transform hover:-translate-y-1"
      >
        Voltar para a Tela Inicial
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
