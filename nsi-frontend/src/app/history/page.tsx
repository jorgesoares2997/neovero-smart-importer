"use client";

import { History, Download, Edit3, CheckCircle2, AlertCircle, X, ChevronLeft, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface ImportHistory {
  id: number;
  originalFilename: string;
  importDate: string;
  status: string;
  totalRows: number;
}

export default function HistoryPage() {
  const [imports, setImports] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedImport, setSelectedImport] = useState<ImportHistory | null>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleEdit = (item: ImportHistory) => {
    setSelectedImport(item);
    setEditModalOpen(true);
  };

  const openDataGrid = () => {
    setEditModalOpen(false);
    // Carrega mock de dados para o Data Grid (idealmente leria a planilha do DB)
    setPreviewData([
      { id: 1, abbreviation: "MONI", family: "MONITOR", model: "CARESCAPE B650", manufacturer: "GE", patrimony: "10023", serialNumber: "SN12345", sectorCode: "SALAA", isDuplicateSerial: false },
      { id: 2, abbreviation: "MONI", family: "MONITOR", model: "CARESCAPE B650", manufacturer: "GE", patrimony: "10024", serialNumber: "SN12345", sectorCode: "SALAB", isDuplicateSerial: true },
      { id: 3, abbreviation: "ARCO", family: "AR CONDICIONADO", model: "SPLIT - 12000 BTUS", manufacturer: "LG", patrimony: "10025", serialNumber: "SN9999", sectorCode: "RECPA", isDuplicateSerial: false },
    ]);
    setIsEditing(true);
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

  useEffect(() => {
    const cachedHistory = localStorage.getItem("nsi_history_cache");
    if (cachedHistory) {
      try {
        const parsed = JSON.parse(cachedHistory);
        if (Array.isArray(parsed)) {
          setImports(parsed);
        }
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse cache", e);
      }
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImports(data);
          localStorage.setItem("nsi_history_cache", JSON.stringify(data));
        } else {
          console.error("API returned non-array data:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (id: number, filename: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1/import'}/history/${id}/download`;
  };

  return (
    <div className="w-full bg-neovero-neutral-50 min-h-full">
      <header className="w-full bg-white border-b border-neovero-neutral-200 px-4 md:px-10 py-6 md:py-8 shadow-sm">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-3 bg-neovero-blue-soft rounded-xl shadow-sm border border-neovero-neutral-200">
            <History className="w-6 h-6 text-neovero-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-neovero-blue">Histórico de Importações</h1>
            <p className="text-sm text-neovero-neutral-800 mt-1">Acompanhe todas as matrizes processadas e higienizadas pelo sistema.</p>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-12 flex flex-col gap-10">
        {!isEditing ? (
        <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neovero-neutral-200">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-16 text-neovero-neutral-800 animate-pulse font-medium">
                Carregando histórico...
              </div>
            ) : imports.length === 0 ? (
              <div className="text-center py-16 text-neovero-neutral-800 font-medium">
                Nenhuma importação encontrada no banco de dados.
              </div>
            ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#1F4E79] text-white">
                  <th className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Arquivo Original</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Data da Importação</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Linhas</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs whitespace-nowrap text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {imports.map((item, i) => (
                  <tr key={item.id} className={`border-b border-neovero-neutral-200 hover:bg-neovero-blue-soft/50 transition-colors group ${i % 2 !== 0 ? 'bg-[#F9FAFB]' : ''}`}>
                    <td className="p-4 font-bold text-neovero-blue">{item.originalFilename}</td>
                    <td className="p-4 text-neovero-neutral-800 font-medium">
                      {new Date(item.importDate).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-4">
                      {item.status === "COMPLETED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Finalizado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Validação Pendente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-neovero-neutral-800 font-medium">{item.totalRows}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-neovero-neutral-200 rounded-lg text-neovero-neutral-800 transition-colors" 
                          title="Validar / Editar"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDownload(item.id, item.originalFilename)}
                          className="p-2 hover:bg-neovero-orange-soft rounded-lg text-neovero-orange transition-colors" title="Exportar Matriz NSI"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl border border-neovero-neutral-200 shadow-sm">
              <div>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-sm font-bold text-neovero-neutral-800 hover:text-neovero-blue mb-2 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Voltar ao Histórico
                </button>
                <h2 className="text-2xl font-display font-bold text-neovero-blue">Data Grid: {selectedImport?.originalFilename}</h2>
                <p className="text-neovero-neutral-800 mt-1">Re-valide as informações e resolva inconsistências.</p>
              </div>
              
              <button 
                onClick={() => handleDownload(selectedImport!.id, selectedImport!.originalFilename)}
                className="bg-neovero-orange hover:bg-neovero-orange-hover text-white shadow-lg py-3 px-6 rounded-lg font-bold flex items-center gap-3 transition-all transform active:scale-95"
              >
                <Download className="w-5 h-5" />
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
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editModalOpen && selectedImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neovero-blue-dark/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-cardHover w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neovero-neutral-200 flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-neovero-blue">Editar Mapeamento</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-neovero-neutral-800 hover:bg-neovero-neutral-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-neovero-orange-soft border border-neovero-orange/20 rounded-lg p-4 mb-6 flex gap-3 text-neovero-orange">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">A re-validação de matrizes arquivadas abrirá o Data Grid para correções pontuais.</p>
              </div>
              <div className="space-y-4 text-sm text-neovero-neutral-800">
                <div className="flex justify-between border-b border-neovero-neutral-200 pb-2">
                  <span className="font-bold">Arquivo:</span>
                  <span className="text-neovero-blue truncate max-w-[200px]">{selectedImport.originalFilename}</span>
                </div>
                <div className="flex justify-between border-b border-neovero-neutral-200 pb-2">
                  <span className="font-bold">Linhas Inseridas:</span>
                  <span>{selectedImport.totalRows}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-bold">Data do Processamento:</span>
                  <span>{new Date(selectedImport.importDate).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-neovero-neutral-50 border-t border-neovero-neutral-200 flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-neovero-blue hover:bg-neovero-neutral-200 transition-colors">Cancelar</button>
              <button onClick={openDataGrid} className="px-5 py-2.5 rounded-lg font-bold bg-neovero-orange text-white hover:bg-neovero-orange-hover transition-colors shadow-sm">
                Abrir Data Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
