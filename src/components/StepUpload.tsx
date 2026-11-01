import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  BrainCircuit,
  Share2,
  FileCheck
} from 'lucide-react';

interface StepUploadProps {
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({
  onFileUpload,
  onLoadDemo,
  errorMessage,
  onClearError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onClearError();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        alert('Por favor, selecione um arquivo válido do Excel (.xlsx ou .xls).');
        return;
      }
      onFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onClearError();
      onFileUpload(files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Meta Ads + Inteligência Artificial Gemini
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Transforme exportações do Meta Ads em relatórios executivos de alto padrão.
        </h1>
        <p className="text-base text-neutral-400 leading-relaxed">
          Importe a planilha exportada do Gerenciador de Anúncios de qualquer cliente. O sistema identifica
          automaticamente cliente, período, campanhas, objetivos e métricas — agora com{' '}
          <strong className="text-amber-300 font-semibold">Gemini AI</strong> para classificar campanhas complexas,
          gerar insights de tráfego e redigir o resumo executivo.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-300">Falha ao processar arquivo</p>
            <p className="text-red-300/80 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dropzone Card */}
        <div className="lg:col-span-7 bg-[#141518] border border-[#2b2d33] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-[#383a42] bg-[#1a1b20]/60 hover:border-amber-500/50 hover:bg-[#1a1b20]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <UploadCloud className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Selecione ou arraste a planilha .xlsx do Meta Ads
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto mb-6">
              Exporte o relatório no Gerenciador de Anúncios da Meta em formato Excel e solte aqui para leitura imediata.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Selecionar Arquivo do Computador
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadDemo();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#22242a] hover:bg-[#2b2d35] text-amber-300 border border-amber-500/30 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Carregar Exemplo Pronto
              </button>
            </div>

            <p className="text-xs text-neutral-500 mt-5">
              Formatos aceitos: <strong className="text-neutral-400">.xlsx</strong> e{' '}
              <strong className="text-neutral-400">.xls</strong> (suporte a exportações completas ou simplificadas)
            </p>
          </div>

          {/* Quick Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#2b2d33] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-neutral-300 font-medium">Auto-detecção de Cliente</span>
            </div>
            <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#2b2d33] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-neutral-300 font-medium">Reconhecimento de Formato</span>
            </div>
            <div className="bg-[#1a1b20] p-3 rounded-xl border border-[#2b2d33] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-neutral-300 font-medium">Exportação em 2 Abas</span>
            </div>
          </div>
        </div>

        {/* Informative Side Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Novo: Motor de IA Gemini</h4>
                <p className="text-xs text-neutral-400">Classificação inteligente e relatório executivo</p>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Classificação Contextual:</strong> Detecta objetivos e formatos mesmo em nomenclaturas atípicas ou abreviadas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Análise Executiva para Diretoria:</strong> Gera resumo com conquistas, gargalos e recomendações de orçamento.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>
                  <strong>Mensagem Pronta de WhatsApp:</strong> Redige um resumo com emojis e métricas-chave para enviar ao cliente.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Compatibilidade Total</h4>
                <p className="text-xs text-neutral-400">Formatos e colunas suportadas</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
              <div className="bg-[#1a1b20] p-2.5 rounded-lg border border-[#282a30]">
                <strong className="text-white block mb-0.5">Formatos</strong>
                <span className="text-neutral-400">Reels, Panfleto Virtual, Carrossel, Post, Vídeo</span>
              </div>
              <div className="bg-[#1a1b20] p-2.5 rounded-lg border border-[#282a30]">
                <strong className="text-white block mb-0.5">Objetivos</strong>
                <span className="text-neutral-400">Alcance, Engajamento, WhatsApp, Links, ThruPlay</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 via-neutral-900 to-[#141518] border border-amber-500/20 rounded-2xl p-6">
            <h4 className="text-sm font-bold text-amber-300 mb-2">Quer testar sem exportar nada agora?</h4>
            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              Carregue o exemplo pré-configurado do <strong>Supermercado Nova Estrela</strong> com 6 campanhas de mídia paga
              e métricas completas de redes sociais.
            </p>
            <button
              onClick={onLoadDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/15"
            >
              <Sparkles className="w-4 h-4" />
              Carregar Exemplo de Demonstração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
