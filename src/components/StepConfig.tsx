import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Code2
} from 'lucide-react';
import { ClassifierConfig } from '../types';
import { DEFAULT_CLASSIFIER_CONFIG } from '../lib/metaAdsParser';

interface StepConfigProps {
  config: ClassifierConfig;
  onSaveConfig: (newConfig: ClassifierConfig) => void;
  onResetConfig: () => void;
}

export const StepConfig: React.FC<StepConfigProps> = ({
  config,
  onSaveConfig,
  onResetConfig,
}) => {
  const [jsonString, setJsonString] = useState(() => JSON.stringify(config, null, 2));
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonString);
      onSaveConfig(parsed);
      setStatusMessage({ text: 'Configuração salva e aplicada com sucesso!', isError: false });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage({ text: `JSON inválido: ${err.message}`, isError: true });
    }
  };

  const handleReset = () => {
    onResetConfig();
    setJsonString(JSON.stringify(DEFAULT_CLASSIFIER_CONFIG, null, 2));
    setStatusMessage({ text: 'Configuração padrão restaurada.', isError: false });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meta-ads-classifier-rules.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setStatusMessage({ text: 'Não foi possível baixar o JSON.', isError: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Regras de Classificação Heurística</h2>
            <p className="text-xs text-neutral-400">
              Personalize palavras-chave, sinônimos, formatos e prioridades de detecção de objetivos.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              statusMessage.isError
                ? 'bg-red-950/40 border border-red-500/40 text-red-300'
                : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-neutral-400 font-semibold mb-2 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-amber-400" />
              Editor JSON de Regras:
            </span>
            <span className="text-[11px] text-neutral-500">
              Modificações entram em vigor imediatamente para novas importações
            </span>
          </label>
          <textarea
            rows={18}
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            className="w-full bg-[#0d0e10] text-neutral-200 border border-[#2b2d33] rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-400 transition-all"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#26282f]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/15"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Aplicar Configuração</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-neutral-300 border border-[#33353e] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar JSON</span>
            </button>
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-neutral-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
