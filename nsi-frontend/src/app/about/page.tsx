import { CheckCircle2, Bot, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="w-full bg-neovero-neutral-50 min-h-full">
      <header className="w-full bg-white border-b border-neovero-neutral-200 px-4 md:px-10 py-12 md:py-16 shadow-sm text-center">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-neovero-blue mb-4">Sobre o Smart Importer</h1>
          <p className="text-lg text-neovero-neutral-800">
            A ferramenta corporativa definitiva para resolver o pesadelo das migrações de inventário hospitalar e predial.
          </p>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-6 py-16 flex flex-col gap-16">
        {/* Concept */}
        <section className="bg-white rounded-2xl p-8 md:p-12 shadow-card border border-neovero-neutral-200">
          <h2 className="text-2xl font-display font-bold text-neovero-blue mb-6">O Problema & A Solução</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-neovero-neutral-800 leading-relaxed mb-4">
                Na implantação de sistemas de <strong>Engenharia Clínica (CMMS/EAM)</strong>, o maior gargalo sempre foi a higienização das planilhas legadas. Centenas de horas são perdidas cruzando colunas com nomenclaturas diferentes ("Nome do Aparelho" vs "Família do Equipamento") e formatando dados sujos.
              </p>
              <p className="text-neovero-neutral-800 leading-relaxed">
                O <strong>Smart Importer (NSI)</strong> foi concebido para destruir essa fricção. Ele ingere qualquer formato caótico de Excel que o cliente mande e cospe uma matriz relacional perfeita e normatizada, pronta para ir para produção.
              </p>
            </div>
            <div className="bg-neovero-neutral-50 rounded-xl p-6 border border-neovero-neutral-200 flex flex-col justify-center">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-neovero-neutral-800">Mapeamento semântico de colunas sem intervenção manual.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-neovero-neutral-800">Geração de binários XLSX nativos sob estrito padrão arquitetural.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-neovero-neutral-800">Auditoria anti-duplicidade e controle de versionamento.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-display font-bold text-neovero-blue mb-8 text-center">Nossa Tecnologia Subjacente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-neovero-neutral-200 shadow-sm flex items-start gap-5">
              <div className="p-3 bg-neovero-blue-soft rounded-xl text-neovero-blue">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-neovero-blue mb-2">Google Gemini AI</h3>
                <p className="text-sm text-neovero-neutral-800 leading-relaxed">
                  Utilizamos engenharia avançada de prompts na API do Gemini para inferência de tipagem de dados. A IA entende que "Aparelho" significa "Família" e que campos em amarelo não podem estar nulos.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 border border-neovero-neutral-200 shadow-sm flex items-start gap-5">
              <div className="p-3 bg-neovero-orange-soft rounded-xl text-neovero-orange">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-neovero-blue mb-2">Spring Boot & PostgreSQL</h3>
                <p className="text-sm text-neovero-neutral-800 leading-relaxed">
                  Backend construído em Java 21 corporativo, utilizando manipulação avançada de Streams via Apache POI para conversões binárias seguras, persistidas integralmente no Supabase/PostgreSQL via JPA.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center pt-8">
          <Link href="/" className="inline-flex items-center gap-2 bg-neovero-blue text-white px-8 py-4 rounded-xl font-bold hover:bg-neovero-blue-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Voltar para o Importador <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
