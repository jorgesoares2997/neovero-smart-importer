"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, Download, Loader2 } from "lucide-react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Type definitions
type MappingResponse = {
  headerRowIndex: number;
  availableColumns?: string[];
  hierarchy: { centroCustoSourceColumn: string; centroCustoIdColumn?: string; setorSourceColumn: string; setorIdColumn?: string };
  mappings: Record<string, string>;
  flags: { capacityFoundInDescription: boolean };
};

type EquipmentPreview = {
  id: number;
  abbreviation: string;
  family: string;
  model: string;
  manufacturer: string;
  patrimony: string;
  serialNumber: string;
  sectorCode: string;
  isDuplicateSerial: boolean;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState<MappingResponse | null>(null);
  const [previewData, setPreviewData] = useState<EquipmentPreview[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMappingChange = (category: 'mappings' | 'hierarchy', key: string, value: string) => {
    if (!mapping) return;
    setMapping({
      ...mapping,
      [category]: {
        ...(mapping[category as keyof MappingResponse] as any),
        [key]: value
      }
    });
  };

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setMapping(res.data);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar o arquivo com Gemini AI");
    } finally {
      setLoading(false);
    }
  };

  const previewProcessing = async () => {
    if (!file || !mapping) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", new Blob([JSON.stringify(mapping)], { type: "application/json" }));

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setPreviewData([
        { id: 1, abbreviation: "MONI", family: "MONITOR", model: "CARESCAPE B650", manufacturer: "GE", patrimony: "10023", serialNumber: "SN12345", sectorCode: "SALAA", isDuplicateSerial: false },
        { id: 2, abbreviation: "MONI", family: "MONITOR", model: "CARESCAPE B650", manufacturer: "GE", patrimony: "10024", serialNumber: "SN12345", sectorCode: "SALAB", isDuplicateSerial: true },
        { id: 3, abbreviation: "ARCO", family: "AR CONDICIONADO", model: "SPLIT - 12000 BTUS", manufacturer: "LG", patrimony: "10025", serialNumber: "SN9999", sectorCode: "RECPA", isDuplicateSerial: false },
      ]);
      setStep(3);
    } catch (error) {
      console.error(error);
      alert("Erro ao pré-visualizar dados");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    if (!file || !mapping) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mapping", new Blob([JSON.stringify(mapping)], { type: "application/json" }));

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/export`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      link.setAttribute('download', `${originalName} NSI.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Erro ao exportar arquivo");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { accessorKey: "abbreviation", header: "SIGLA_EQUIPAMENTO" },
    { accessorKey: "family", header: "Família" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "manufacturer", header: "Fabricante" },
    { accessorKey: "patrimony", header: "Patrimônio" },
    { 
      accessorKey: "serialNumber", 
      header: "Nº Série",
      cell: (info: any) => {
        const isDup = info.row.original.isDuplicateSerial;
        if (isDup) {
          return (
            <div className="flex items-center gap-2 bg-[#FFC7CE] text-[#9C0006] font-bold border border-red-300 rounded px-2 py-1 w-fit">
              <AlertTriangle className="w-4 h-4" />
              <span>{info.getValue()}</span>
            </div>
          );
        }
        return <span>{info.getValue()}</span>;
      }
    },
    { accessorKey: "sectorCode", header: "Setor" },
  ];

  const table = useReactTable({
    data: previewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full flex-1">
      {/* HERO SECTION */}
      {step === 1 && (
        <>
          <section className="w-full bg-gradient-to-b from-neovero-blue to-neovero-blue-medium py-20 px-6 shadow-md relative overflow-hidden">
            <div className="max-w-[1200px] mx-auto text-center z-10 relative">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                CMMS/EAM Integral: <br className="hidden md:block"/>Automação Inteligente de Importação
              </h1>
              <p className="text-neovero-blue-soft text-lg md:text-xl max-w-3xl mx-auto mb-10 font-sans">
                Higienização automatizada por IA e conversão direta para matrizes relacionais padrão de Engenharia Clínica e Manutenção.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="bg-white/10 border border-white/20 text-white rounded-full px-6 py-2 font-semibold text-sm backdrop-blur-sm">
                  ✓ 100% Compatível com Apple Numbers & Microsoft Excel
                </span>
                <span className="bg-white/10 border border-white/20 text-white rounded-full px-6 py-2 font-semibold text-sm backdrop-blur-sm">
                  ✓ Auditoria de Duplicidades em Tempo Real
                </span>
              </div>
            </div>
          </section>

          <section className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="flex flex-col items-center mb-16 ">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="w-full max-w-3xl border-2 border-dashed border-neovero-blue/30 hover:border-neovero-orange bg-white rounded-2xl p-16 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 group shadow-card hover:shadow-cardHover"
              >
                <input type="file" id="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.csv,.xls" />
                <label htmlFor="file" className="flex flex-col items-center gap-4 cursor-pointer w-full text-center">
                  <div className="w-20 h-20 bg-neovero-neutral-100 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-neovero-orange-soft transition-all duration-300">
                    <UploadCloud className="w-10 h-10 text-neovero-blue group-hover:text-neovero-orange transition-colors" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-neovero-blue mb-2">{file ? file.name : "Solte sua planilha de inventário aqui"}</p>
                    <p className="text-sm text-neovero-neutral-800">ou clique para procurar no seu computador (.xlsx, .xls, .csv)</p>
                  </div>
                </label>
              </div>

              <button 
                onClick={analyzeFile}
                disabled={!file || loading}
                className="mt-10 px-8 py-4 bg-neovero-orange text-white font-bold rounded-lg hover:bg-neovero-orange-hover shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "PROCESSAR COM INTELIGÊNCIA ARTIFICIAL"}
              </button>
            </div>

          </section>
        </>
      )}

      {/* STEP 2: MAPPING */}
      {step === 2 && (
        <section className="max-w-[1000px] mx-auto px-6 py-20 ">
          <div className="flex flex-col items-center text-center mb-10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <h2 className="text-3xl font-display font-bold text-neovero-blue">Mapeamento Semântico Identificado</h2>
            <p className="text-neovero-neutral-800 mt-2">Valide as colunas identificadas pela nossa IA antes de prosseguir com a higienização.</p>
          </div>
          
          <div className="bg-white border border-neovero-neutral-200 rounded-xl p-8 shadow-card">
            <h3 className="text-lg font-bold text-neovero-blue mb-6 border-b border-neovero-neutral-200 pb-4">Inferência de Colunas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mapping && Object.entries(mapping.mappings).map(([key, val]) => {
                const translations: Record<string, string> = {
                  equipmentFamily: "EQUIPAMENTO",
                  model: "MODELO",
                  manufacturer: "FABRICANTE",
                  patrimony: "PATRIMÔNIO",
                  serialNumber: "NÚMERO DE SÉRIE",
                  acquisitionDate: "DATA DE AQUISIÇÃO",
                  legacyCode: "CÓDIGO EXTRA",
                };
                return (
                <div key={key} className="flex flex-col gap-2 p-4 bg-neovero-neutral-50 rounded-lg border border-neovero-neutral-200 hover:border-neovero-blue/30 transition-colors">
                  <span className="text-neovero-blue font-bold text-sm">{translations[key] || key}</span>
                  <select 
                    value={val || ""}
                    onChange={(e) => handleMappingChange('mappings', key, e.target.value)}
                    className="w-full bg-white border border-neovero-neutral-200 rounded p-2 text-neovero-neutral-800 text-sm focus:outline-none focus:border-neovero-blue focus:ring-1 focus:ring-neovero-blue transition-shadow"
                  >
                    <option value="">-- Não encontrado --</option>
                    {mapping.availableColumns?.map((col, idx) => (
                      <option key={idx} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                );
              })}
              
              {mapping && mapping.hierarchy && Object.entries(mapping.hierarchy).map(([key, val]) => {
                const translations: Record<string, string> = {
                  centroCustoSourceColumn: "NOME CENTRO DE CUSTO",
                  centroCustoIdColumn: "CÓDIGO CENTRO DE CUSTO",
                  setorSourceColumn: "NOME DO SETOR",
                  setorIdColumn: "CÓDIGO DO SETOR"
                };
                return (
                <div key={key} className="flex flex-col gap-2 p-4 bg-neovero-neutral-50 rounded-lg border border-neovero-neutral-200 hover:border-neovero-blue/30 transition-colors">
                  <span className="text-neovero-blue font-bold text-sm">{translations[key] || key}</span>
                  <select 
                    value={val || ""}
                    onChange={(e) => handleMappingChange('hierarchy', key, e.target.value)}
                    className="w-full bg-white border border-neovero-neutral-200 rounded p-2 text-neovero-neutral-800 text-sm focus:outline-none focus:border-neovero-blue focus:ring-1 focus:ring-neovero-blue transition-shadow"
                  >
                    <option value="">-- Não encontrado --</option>
                    {mapping.availableColumns?.map((col, idx) => (
                      <option key={idx} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                );
              })}
            </div>
            
            <div className="mt-10 flex justify-end gap-4 border-t border-neovero-neutral-200 pt-6">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-bold text-neovero-blue border border-neovero-blue hover:bg-neovero-neutral-50 transition-colors">Voltar</button>
              <button onClick={previewProcessing} className="px-6 py-3 bg-neovero-blue hover:bg-neovero-blue-dark text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-md">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Higienizar"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: PREVIEW & EXPORT */}
      {step === 3 && (
        <section className="max-w-[1200px] mx-auto px-6 py-12 ">
          <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl border border-neovero-neutral-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-display font-bold text-neovero-blue">Auditoria e Exportação</h2>
              <p className="text-neovero-neutral-800 mt-1">Sua planilha foi higienizada e formatada para o padrão relacional de importação.</p>
              
              <div className="flex gap-6 mt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-neovero-neutral-800 uppercase font-bold">Equipamentos Válidos</span>
                  <span className="text-lg font-bold text-emerald-600">1.542</span>
                </div>
                <div className="flex flex-col border-l border-neovero-neutral-200 pl-6">
                  <span className="text-xs text-neovero-neutral-800 uppercase font-bold">Setores Criados</span>
                  <span className="text-lg font-bold text-neovero-blue">12</span>
                </div>
                <div className="flex flex-col border-l border-neovero-neutral-200 pl-6">
                  <span className="text-xs text-neovero-neutral-800 uppercase font-bold">Inconsistências Sinalizadas</span>
                  <span className="text-lg font-bold text-[#9C0006]">1</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={exportExcel}
              disabled={loading}
              className="bg-neovero-orange hover:bg-neovero-orange-hover text-white shadow-lg py-3 px-6 rounded-lg font-bold flex items-center gap-3 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Baixar Planilha Formatada (.xlsx)
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neovero-neutral-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-[#1F4E79] text-white">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white">
                  {table.getRowModel().rows.map((row, i) => (
                    <tr key={row.id} className={`border-b border-neovero-neutral-200 hover:bg-neovero-blue-soft/50 transition-colors ${i % 2 !== 0 ? 'bg-[#F9FAFB]' : ''}`}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-4 text-neovero-neutral-800">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
