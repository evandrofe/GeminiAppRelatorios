import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ClipboardPaste,
  HelpCircle,
  Users,
  TrendingUp,
  Percent,
  Calendar,
  Share2
} from 'lucide-react';
import { CapaData, ReportMeta } from '../types';
import { CapaModelView } from './CapaModelView';

interface StepCapaProps {
  meta: ReportMeta;
  capa: CapaData;
  onChangeCapa: (newCapa: CapaData) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const StepCapa: React.FC<StepCapaProps> = ({
  meta,
  capa,
  onChangeCapa,
  onBack,
  onContinue,
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiText, setAiText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleFieldChange = (
    platform: 'fb' | 'ig',
    field: keyof CapaData['fb'],
    value: string
  ) => {
    onChangeCapa({
      ...capa,
      [platform]: {
        ...capa[platform],
        [field]: value,
      },
    });
  };

  const handleExtractWithAi = async () => {
    if (!aiText.trim()) return;
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/gemini/parse-capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível extrair os dados.');
      }

      // Merge extracted fields with current
      onChangeCapa({
        fb: {
          ...capa.fb,
          ...(data.data.fb || {}),
        },
        ig: {
          ...capa.ig,
          ...(data.data.ig || {}),
        },
      });

      setShowAiModal(false);
      setAiText('');
    } catch (err: any) {
      setExtractError(err.message || 'Erro ao processar com Gemini.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 mb-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Passo 3 de 4
            </span>
            <span className="text-xs text-neutral-400">Página de Rosto / Capa Social</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Métricas de Audiência Social
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Preencha os indicadores de redes sociais do cliente para estampar a primeira aba do relatório Excel (Capa).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowAiModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            title="Copie texto ou anotações do Meta Business Suite e deixe o Gemini preencher todos os campos"
          >
            <Sparkles className="w-4 h-4" />
            <span>Colar Texto & Extrair com IA</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-2.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-neutral-200 border border-[#33353e] font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar Prévia</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Prévia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs for FB & IG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* FACEBOOK CARD */}
        <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#26282f]">
            <div className="w-10 h-10 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] flex items-center justify-center font-bold text-lg">
              f
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Facebook
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  Página
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Dados demográficos e crescimento</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Seguidores Atuais
                </label>
                <input
                  type="text"
                  placeholder="Ex: 18.420"
                  value={capa.fb.seguidores}
                  onChange={(e) => handleFieldChange('fb', 'seguidores', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Seguidores Mês Anterior
                </label>
                <input
                  type="text"
                  placeholder="Ex: 17.890"
                  value={capa.fb.segAnterior}
                  onChange={(e) => handleFieldChange('fb', 'segAnterior', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  % Homens
                </label>
                <input
                  type="text"
                  placeholder="Ex: 34%"
                  value={capa.fb.homens}
                  onChange={(e) => handleFieldChange('fb', 'homens', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  % Mulheres
                </label>
                <input
                  type="text"
                  placeholder="Ex: 66%"
                  value={capa.fb.mulheres}
                  onChange={(e) => handleFieldChange('fb', 'mulheres', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Faixa Etária Principal
              </label>
              <input
                type="text"
                placeholder="Ex: 25 a 54 anos"
                value={capa.fb.faixa}
                onChange={(e) => handleFieldChange('fb', 'faixa', e.target.value)}
                className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Contas Alcançadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: 48.910"
                  value={capa.fb.alcancadas}
                  onChange={(e) => handleFieldChange('fb', 'alcancadas', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Visitas à Página
                </label>
                <input
                  type="text"
                  placeholder="Ex: 3.420"
                  value={capa.fb.visitas}
                  onChange={(e) => handleFieldChange('fb', 'visitas', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* INSTAGRAM CARD */}
        <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#26282f]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold text-lg">
              ig
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Instagram
                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                  Perfil
                </span>
              </h3>
              <p className="text-xs text-neutral-400">Dados de audiência e engajamento</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Seguidores Atuais
                </label>
                <input
                  type="text"
                  placeholder="Ex: 42.850"
                  value={capa.ig.seguidores}
                  onChange={(e) => handleFieldChange('ig', 'seguidores', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Seguidores Mês Anterior
                </label>
                <input
                  type="text"
                  placeholder="Ex: 39.710"
                  value={capa.ig.segAnterior}
                  onChange={(e) => handleFieldChange('ig', 'segAnterior', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  % Homens
                </label>
                <input
                  type="text"
                  placeholder="Ex: 28%"
                  value={capa.ig.homens}
                  onChange={(e) => handleFieldChange('ig', 'homens', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  % Mulheres
                </label>
                <input
                  type="text"
                  placeholder="Ex: 72%"
                  value={capa.ig.mulheres}
                  onChange={(e) => handleFieldChange('ig', 'mulheres', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Faixa Etária Principal
              </label>
              <input
                type="text"
                placeholder="Ex: 25 a 44 anos"
                value={capa.ig.faixa}
                onChange={(e) => handleFieldChange('ig', 'faixa', e.target.value)}
                className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Contas Alcançadas
                </label>
                <input
                  type="text"
                  placeholder="Ex: 112.400"
                  value={capa.ig.alcancadas}
                  onChange={(e) => handleFieldChange('ig', 'alcancadas', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Visitas ao Perfil
                </label>
                <input
                  type="text"
                  placeholder="Ex: 14.890"
                  value={capa.ig.visitas}
                  onChange={(e) => handleFieldChange('ig', 'visitas', e.target.value)}
                  className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Box (Modelo Oficial Fiel ao PDF) */}
      {showPreview && (
        <div className="mb-8 bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Prévia Visual da Capa Oficial (Fiel ao Modelo)
            </h4>
            <span className="text-[11px] text-neutral-400">Padronização visual com silhuetas, ícones e badges oficiais</span>
          </div>

          <CapaModelView meta={meta} capa={capa} />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-[#1e2025] hover:bg-[#272930] text-neutral-300 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Revisão</span>
        </button>

        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
        >
          <span>Visualizar Relatório & Gerar Análise IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Extraction Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#17181c] border border-[#2b2d33] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Extrair Métricas da Capa com Gemini</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Cole o texto de insights copiado do Meta Business Suite, relatório mensal ou mensagem do WhatsApp. A IA
              Gemini vai identificar seguidores, faixa etária, gênero e visitas para Facebook e Instagram.
            </p>

            {extractError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
                {extractError}
              </div>
            )}

            <textarea
              rows={6}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Exemplo: No Instagram fechamos com 42.850 seguidores (eram 39.710 no mês passado). O público é 72% feminino e 28% masculino, principal faixa de 25 a 44 anos. Alcançamos 112 mil contas e tivemos 14.890 visitas ao perfil..."
              className="w-full bg-[#121316] border border-[#2e3037] rounded-xl p-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-400 mb-4 font-sans"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExtractWithAi}
                disabled={isExtracting || !aiText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExtracting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processando com Gemini...</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Extrair Informações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
