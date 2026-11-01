import React from 'react';
import {
  FileSpreadsheet,
  Printer,
  Sparkles,
  UploadCloud,
  Layers,
  Settings,
  Share2,
  RefreshCw
} from 'lucide-react';
import { ReportMeta } from '../types';

interface HeaderProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  meta: ReportMeta | null;
  hasData: boolean;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  onReset: () => void;
  onLoadDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  meta,
  hasData,
  onExportExcel,
  isExportingExcel,
  onReset,
  onLoadDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c0d0e]/95 backdrop-blur-md border-b border-[#262626] px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectStep(1)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#121316] rounded-[10px] flex items-center justify-center">
              <span className="text-amber-400 font-extrabold text-lg tracking-tight">CRE</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Relatório de <span className="text-amber-400 font-extrabold">Impulsionamento</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              {meta?.cliente ? `${meta.cliente} • ${meta.mes} ${meta.ano}` : 'Meta Ads Inteligente & Executivo'}
            </p>
          </div>
        </div>

        {/* Navigation Stepper */}
        <div className="flex items-center gap-1 bg-[#17181c] p-1 rounded-xl border border-[#2b2d33] overflow-x-auto max-w-full">
          {[
            { step: 1, label: 'Importar', icon: UploadCloud },
            { step: 2, label: 'Classificação', icon: Layers, disabled: !hasData },
            { step: 3, label: 'Capa Social', icon: Share2, disabled: !hasData },
            { step: 4, label: 'Relatório & IA', icon: Sparkles, disabled: !hasData },
            { step: 5, label: 'Regras', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            return (
              <button
                key={item.step}
                disabled={item.disabled}
                onClick={() => onSelectStep(item.step)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 shadow-md font-bold'
                    : item.disabled
                    ? 'text-neutral-600 cursor-not-allowed'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-950' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {!hasData ? (
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
              title="Carregar planilha modelo de demonstração para testar"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Demonstração</span>
            </button>
          ) : (
            <>
              <button
                onClick={onExportExcel}
                disabled={isExportingExcel}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{isExportingExcel ? 'Gerando...' : 'Baixar Excel'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all cursor-pointer"
                title="Imprimir ou Salvar PDF"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-400" />
                <span>PDF</span>
              </button>

              <button
                onClick={onReset}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
                title="Limpar e carregar novo arquivo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
