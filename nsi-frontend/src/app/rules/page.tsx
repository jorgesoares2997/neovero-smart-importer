"use client";

import { useState, useEffect } from "react";
import { Settings, Plus, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface GlobalRule {
  id?: number;
  sourceColumnName: string;
  targetMappingField: string;
  description: string;
}

export default function RulesPage() {
  const [rules, setRules] = useState<GlobalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newRule, setNewRule] = useState<GlobalRule>({ sourceColumnName: "", targetMappingField: "", description: "" });

  const fetchRules = () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/rules`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRules(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.sourceColumnName || !newRule.targetMappingField) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        setNewRule({ sourceColumnName: "", targetMappingField: "", description: "" });
        setFormOpen(false);
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/rules/${id}`, {
        method: "DELETE"
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-neovero-neutral-50 min-h-full">
      <header className="w-full bg-white border-b border-neovero-neutral-200 px-4 md:px-10 py-6 md:py-8 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neovero-blue-soft rounded-xl shadow-sm border border-neovero-neutral-200">
              <Settings className="w-6 h-6 text-neovero-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-neovero-blue">Regras de IA (Engine)</h1>
              <p className="text-sm text-neovero-neutral-800 mt-1">Configure o comportamento base do modelo Gemini para colunas conhecidas.</p>
            </div>
          </div>
          <button 
            onClick={() => setFormOpen(true)}
            className="bg-neovero-orange hover:bg-neovero-orange-hover text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" /> Nova Regra
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {formOpen && (
          <div className="bg-white rounded-xl shadow-card border border-neovero-neutral-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-neovero-blue flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-neovero-orange" />
                Criar Nova Regra Global
              </h2>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neovero-neutral-600 mb-1 uppercase tracking-wider">Coluna da Planilha</label>
                <input 
                  type="text" 
                  className="w-full border border-neovero-neutral-200 rounded-lg p-2.5 outline-none focus:border-neovero-blue focus:ring-1 focus:ring-neovero-blue text-sm"
                  placeholder="Ex: LOCAL"
                  value={newRule.sourceColumnName}
                  onChange={e => setNewRule({...newRule, sourceColumnName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neovero-neutral-600 mb-1 uppercase tracking-wider">Mapear Para (Destino)</label>
                <select 
                  className="w-full border border-neovero-neutral-200 rounded-lg p-2.5 outline-none focus:border-neovero-blue focus:ring-1 focus:ring-neovero-blue text-sm bg-white"
                  value={newRule.targetMappingField}
                  onChange={e => setNewRule({...newRule, targetMappingField: e.target.value})}
                  required
                >
                  <option value="" disabled>Selecione um destino...</option>
                  <option value="centroCustoSourceColumn">Centro de Custo</option>
                  <option value="setorSourceColumn">Setor</option>
                  <option value="equipmentFamily">Família do Equipamento</option>
                  <option value="model">Modelo</option>
                  <option value="manufacturer">Fabricante</option>
                  <option value="patrimony">Patrimônio</option>
                  <option value="serialNumber">Número de Série</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neovero-neutral-600 mb-1 uppercase tracking-wider">Descrição (Opcional)</label>
                <input 
                  type="text" 
                  className="w-full border border-neovero-neutral-200 rounded-lg p-2.5 outline-none focus:border-neovero-blue focus:ring-1 focus:ring-neovero-blue text-sm"
                  placeholder="Ex: Padrão do Hospital X"
                  value={newRule.description}
                  onChange={e => setNewRule({...newRule, description: e.target.value})}
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 font-bold text-neovero-neutral-600 hover:bg-neovero-neutral-100 rounded-lg transition-colors text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-neovero-blue hover:bg-neovero-blue-dark text-white rounded-lg font-bold shadow-sm transition-colors text-sm">Salvar Regra</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neovero-neutral-200">
          {loading ? (
            <div className="text-center py-16 text-neovero-neutral-800 animate-pulse font-medium">Carregando regras ativas...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-16">
              <Settings className="w-12 h-12 text-neovero-neutral-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-neovero-neutral-800">Nenhuma regra definida</h3>
              <p className="text-sm text-neovero-neutral-600 max-w-md mx-auto mt-2">Crie regras para otimizar o processamento e pular o raciocínio da IA em colunas que você já conhece o padrão.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#1F4E79] text-white">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Se a coluna original for...</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Mapear Sempre Para</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Descrição</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={rule.id} className={`border-b border-neovero-neutral-200 hover:bg-neovero-blue-soft/50 transition-colors ${i % 2 !== 0 ? 'bg-[#F9FAFB]' : ''}`}>
                    <td className="p-4 font-bold text-neovero-orange">"{rule.sourceColumnName}"</td>
                    <td className="p-4 text-neovero-blue font-bold">{rule.targetMappingField}</td>
                    <td className="p-4 text-neovero-neutral-600">{rule.description || "-"}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => rule.id && handleDelete(rule.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir regra">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
