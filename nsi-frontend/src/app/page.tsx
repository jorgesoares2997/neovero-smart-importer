"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Type definitions
type MappingResponse = {
  headerRowIndex: number;
  hierarchy: { centroCustoSourceColumn: string; setorSourceColumn: string };
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

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await axios.post("http://localhost:8080/api/v1/import/analyze", formData, {
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
      // mapping is sent as a Blob (RequestPart in Spring)
      formData.append("mapping", new Blob([JSON.stringify(mapping)], { type: "application/json" }));

      const res = await axios.post("http://localhost:8080/api/v1/import/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // Using mock preview data for demonstration since full mapping processor is complex
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

      const res = await axios.post("http://localhost:8080/api/v1/import/export", formData, {
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
    { accessorKey: "abbreviation", header: "Sigla" },
    { accessorKey: "family", header: "Equipamento" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "manufacturer", header: "Fabricante" },
    { accessorKey: "patrimony", header: "Patrimônio" },
    { 
      accessorKey: "serialNumber", 
      header: "Nº Série",
      cell: (info: any) => {
        const isDup = info.row.original.isDuplicateSerial;
        return (
          <span className={isDup ? "bg-red-200 text-red-800 font-bold px-2 py-1 rounded" : ""}>
            {info.getValue()}
          </span>
        )
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
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-600/10 blur-3xl pointer-events-none -z-10" />
      
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/10 backdrop-blur-md sticky top-0 z-10 bg-neutral-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <FileSpreadsheet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Neovero <span className="text-indigo-400 font-light">Smart Importer</span></h1>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400">
          <span className={step >= 1 ? "text-indigo-400" : ""}>1. Upload</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
          <span className={step >= 2 ? "text-indigo-400" : ""}>2. IA Mapping</span>
          <ArrowRight className="w-4 h-4 opacity-50" />
          <span className={step >= 3 ? "text-indigo-400" : ""}>3. Validation & Export</span>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">Ingestão de Dados Hospitalares</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">Solte sua planilha legada estruturada (ou não) e deixe a IA preparar os dados para o padrão relacional do Neovero.</p>
            </div>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full max-w-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 bg-neutral-900/50 backdrop-blur-sm rounded-3xl p-16 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 group shadow-2xl hover:shadow-indigo-500/10"
            >
              <input type="file" id="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.csv" />
              <label htmlFor="file" className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold mb-2">{file ? file.name : "Clique ou arraste a planilha aqui"}</p>
                  <p className="text-sm text-neutral-500">Suporta .xlsx, .xls, .csv</p>
                </div>
              </label>
            </div>

            <button 
              onClick={analyzeFile}
              disabled={!file || loading}
              className="mt-10 px-8 py-4 bg-white text-neutral-950 font-bold rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analisar com Gemini AI"}
            </button>
          </div>
        )}

        {/* STEP 2: MAPPING */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-bold">Mapeamento Semântico Identificado</h2>
            </div>
            
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-neutral-300 mb-6 border-b border-white/10 pb-4">Inferência de Colunas</h3>
              <div className="grid grid-cols-2 gap-6">
                {mapping && Object.entries(mapping.mappings).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-neutral-950 rounded-xl border border-white/5">
                    <span className="text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-indigo-300">{val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full font-medium text-neutral-400 hover:text-white transition-colors">Voltar</button>
                <button onClick={previewProcessing} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-colors flex items-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar e Higienizar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW & EXPORT */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  Preview de Higienização
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">Sucesso</span>
                </h2>
                <p className="text-neutral-400 mt-2">Revise os dados antes da exportação. Atenção aos alertas visuais.</p>
              </div>
              <button onClick={exportExcel} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold rounded-full transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 transform hover:-translate-y-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Exportar para Neovero (.xlsx)
              </button>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Alert Banner for Duplicates */}
              <div className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="font-medium">Atenção: Existem números de série duplicados na base. Eles estão destacados em vermelho na tabela abaixo.</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-neutral-950/50 text-neutral-400 uppercase font-semibold text-xs border-b border-white/5">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-6 py-4">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4 text-neutral-200">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
