import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  Layers,
  HelpCircle,
  Wand2,
  MapPin
} from 'lucide-react';
import { CampaignRow, ObjectiveType, ReportMeta } from '../types';
import { OBJ_COLORS, OBJ_LABELS, OBJ_OPTIONS } from '../lib/metaAdsParser';

interface StepReviewProps {
  meta: ReportMeta;
  campaigns: CampaignRow[];
  onUpdateObjective: (campaignId: string, newObjective: ObjectiveType) => void;
  onUpdateDisplayName: (campaignId: string, newDisplayName: string) => void;
  onUpdateFormat: (campaignId: string, newFormat: string) => void;
  onUpdateFiltro: (campaignId: string, newFiltro: string) => void;
  onUpdateCidade: (campaignId: string, newCidade: string) => void;
  onBatchUpdateFiltroCidade?: (filtro: string, cidade: string) => void;
  onAiClassify: () => Promise<void>;
  isAiClassifying: boolean;
  onContinue: () => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  meta,
  campaigns,
  onUpdateObjective,
  onUpdateDisplayName,
  onUpdateFormat,
  onUpdateFiltro,
  onUpdateCidade,
  onBatchUpdateFiltroCidade,
  onAiClassify,
  isAiClassifying,
  onContinue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterObjective, setFilterObjective] = useState<string>('all');
  const [batchFiltro, setBatchFiltro] = useState('');
  const [batchCidade, setBatchCidade] = useState('');
  const [batchAppliedMsg, setBatchAppliedMsg] = useState(false);

  const handleApplyBatchFiltroCidade = () => {
    if (!batchFiltro.trim() && !batchCidade.trim()) return;
    if (onBatchUpdateFiltroCidade) {
      onBatchUpdateFiltroCidade(batchFiltro.trim(), batchCidade.trim());
    } else {
      campaigns.forEach((c) => {
        if (batchFiltro.trim()) onUpdateFiltro(c.id, batchFiltro.trim());
        if (batchCidade.trim()) onUpdateCidade(c.id, batchCidade.trim());
      });
    }
    setBatchAppliedMsg(true);
    setTimeout(() => setBatchAppliedMsg(false), 3000);
  };

  const pendingCount = campaigns.filter((c) => c.objective === 'indefinido').length;
  const totalCount = campaigns.length;
  const classifiedCount = totalCount - pendingCount;

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.format.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesObj = filterObjective === 'all' || c.objective === filterObjective;
    return matchesSearch && matchesObj;
  });

  // Calculate objective counts
  const counts: Record<string, number> = {};
  campaigns.forEach((c) => {
    counts[c.objective] = (counts[c.objective] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* File & Client Summary Header */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Passo 2 de 4
              </span>
              <span className="text-xs text-neutral-400">Revisão de Metadados e Objetivos</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {meta.cliente || 'Cliente Detectado'}{' '}
              <span className="text-neutral-400 font-normal text-lg">
                ({meta.mes} {meta.ano})
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Arquivo: <code className="text-amber-300/80 font-mono">{meta.originalFileName}</code>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={onAiClassify}
              disabled={isAiClassifying}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              title="Acionar Gemini para analisar os títulos e métricas das campanhas com IA"
            >
              {isAiClassifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Classificando com Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Classificar com Gemini IA</span>
                </>
              )}
            </button>

            <button
              onClick={onContinue}
              className="flex-1 lg:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Avançar para Capa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="mt-5 pt-4 border-t border-[#26282f] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {pendingCount > 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>{pendingCount}</strong> de <strong>{totalCount}</strong> campanhas precisam de revisão ou
                  podem ser resolvidas automaticamente pelo Gemini.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Todas as <strong>{totalCount}</strong> campanhas foram categorizadas com sucesso!</span>
              </div>
            )}
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="bg-[#1a1b20] px-2.5 py-1 rounded-md border border-[#2e3037]">
              Classificadas: <strong className="text-white">{classifiedCount}</strong>/{totalCount}
            </span>
          </div>
        </div>

        {/* Objective Distribution Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setFilterObjective('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
              filterObjective === 'all'
                ? 'bg-neutral-200 text-neutral-900 border-white'
                : 'bg-[#1a1b20] text-neutral-400 border-[#2e3037] hover:text-white'
            }`}
          >
            Todas ({totalCount})
          </button>
          {OBJ_OPTIONS.map((obj) => {
            const count = counts[obj] || 0;
            if (count === 0) return null;
            const style = OBJ_COLORS[obj];
            const isSelected = filterObjective === obj;
            return (
              <button
                key={obj}
                onClick={() => setFilterObjective(isSelected ? 'all' : obj)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? `${style.bg} ${style.text} border-current ring-1 ring-current`
                    : `${style.bg} ${style.text} ${style.border} opacity-80 hover:opacity-100`
                }`}
              >
                <span>{OBJ_LABELS[obj]}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch Inserter for Filtro and Cidade */}
      <div className="bg-[#181a20] border border-[#2b2d33] rounded-2xl p-4 mb-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Inserir Filtro e Cidade em Lote</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                  Campos Manuais
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400">
                Preencha uma vez para aplicar a todas as {campaigns.length} ações, ou ajuste individualmente em cada linha da tabela.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Filtro (ex: 18 a 65 anos • Raio 5km)"
              value={batchFiltro}
              onChange={(e) => setBatchFiltro(e.target.value)}
              className="bg-[#111215] border border-[#33353e] focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 w-full sm:w-56 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Cidade (ex: Três Lagoas - MS)"
              value={batchCidade}
              onChange={(e) => setBatchCidade(e.target.value)}
              className="bg-[#111215] border border-[#33353e] focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-500 w-full sm:w-48 focus:outline-none transition-colors"
            />
            <button
              onClick={handleApplyBatchFiltroCidade}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md cursor-pointer shrink-0"
            >
              Aplicar a Todas
            </button>
            {batchAppliedMsg && (
              <span className="text-xs font-bold text-emerald-400 animate-pulse">
                ✓ Aplicado!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-t-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, formato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1b20] border border-[#2e3037] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        <div className="text-xs text-neutral-400 self-end sm:self-auto">
          Mostrando <strong>{filteredCampaigns.length}</strong> de {campaigns.length} campanhas
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#141518] border-x border-b border-[#2b2d33] rounded-b-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a1b20] border-b border-[#2b2d33] text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Campanha / Ação Formatada</th>
                <th className="py-3 px-3">Formato</th>
                <th className="py-3 px-3">Validade</th>
                <th className="py-3 px-3">Objetivo Detectado</th>
                <th className="py-3 px-3 text-right">Valor Gasto</th>
                <th className="py-3 px-3 text-right">Alcance</th>
                <th className="py-3 px-3 text-right">Métrica Principal</th>
                <th className="py-3 px-2 text-center min-w-[130px]">Filtro (Público)</th>
                <th className="py-3 px-2 text-center min-w-[110px]">Cidade</th>
                <th className="py-3 px-4 text-center">Ajustar Objetivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]">
              {filteredCampaigns.map((c) => {
                const style = OBJ_COLORS[c.objective] || OBJ_COLORS.indefinido;
                const isReels = /^Reels/i.test(c.objective);

                return (
                  <tr key={c.id} className="hover:bg-[#1a1b20]/60 transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="max-w-md">
                        <input
                          type="text"
                          value={c.displayName}
                          onChange={(e) => onUpdateDisplayName(c.id, e.target.value)}
                          className="font-semibold text-white bg-transparent hover:bg-[#202228] px-1.5 py-0.5 rounded border border-transparent hover:border-[#383b44] focus:border-amber-400 focus:bg-[#202228] focus:outline-none transition-all w-full truncate"
                          title="Clique para editar o nome exibido da ação no relatório"
                        />
                        <span className="text-[11px] text-neutral-500 block truncate mt-0.5" title={c.name}>
                          {c.name}
                        </span>

                        {c.aiNotes && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{c.aiNotes}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <input
                        type="text"
                        value={c.format}
                        onChange={(e) => onUpdateFormat(c.id, e.target.value)}
                        className="bg-[#1f2026] text-neutral-200 border border-[#2e3037] rounded px-2 py-1 text-xs w-24 focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* Validity */}
                    <td className="py-3 px-3 whitespace-nowrap text-neutral-400">
                      {c.validity || '—'}
                    </td>

                    {/* Objective Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        {OBJ_LABELS[c.objective] || c.objective}
                      </span>
                    </td>

                    {/* Spent */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-medium text-white">
                      R$ {c.spent > 0 ? c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </td>

                    {/* Reach */}
                    <td className="py-3 px-3 whitespace-nowrap text-right text-neutral-300">
                      {c.reach > 0 ? c.reach.toLocaleString('pt-BR') : '—'}
                    </td>

                    {/* Main Metric */}
                    <td className="py-3 px-3 whitespace-nowrap text-right text-neutral-300">
                      {(() => {
                        const isAlcance = c.objective === 'Alc' || c.objective === 'ReelsAlc';
                        const isEngEqualToReach = c.reach > 0 && c.eng === c.reach;
                        const shouldSuppressEng = isAlcance && (isEngEqualToReach || c.objective === 'Alc');

                        if (c.conv > 0) {
                          return <span className="text-emerald-400 font-semibold">{c.conv} conversas</span>;
                        }
                        if (isReels && c.views > 0) {
                          return <span className="text-amber-400 font-semibold">{c.views.toLocaleString('pt-BR')} views</span>;
                        }
                        if (c.links > 0) {
                          return <span className="text-cyan-300">{c.links.toLocaleString('pt-BR')} cliques</span>;
                        }
                        if (c.eng > 0 && !shouldSuppressEng) {
                          return <span className="text-purple-300">{c.eng.toLocaleString('pt-BR')} engaj.</span>;
                        }
                        return <span className="text-neutral-500">—</span>;
                      })()}
                    </td>

                    {/* Filtro manual */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="Ex: Raio 5km"
                        value={c.filtro || ''}
                        onChange={(e) => onUpdateFiltro(c.id, e.target.value)}
                        className="bg-[#111215] border border-[#2e3037] focus:border-amber-400 rounded px-2 py-1 text-xs text-neutral-200 w-32 focus:outline-none truncate"
                        title="Filtro de segmentação (ex: 18 a 65 anos • Raio 5km)"
                      />
                    </td>

                    {/* Cidade manual */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <input
                        type="text"
                        placeholder="Ex: Sua Cidade"
                        value={c.cidade || ''}
                        onChange={(e) => onUpdateCidade(c.id, e.target.value)}
                        className="bg-[#111215] border border-[#2e3037] focus:border-amber-400 rounded px-2 py-1 text-xs text-neutral-200 w-28 focus:outline-none truncate"
                        title="Cidade da campanha"
                      />
                    </td>

                    {/* Selector */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <select
                        value={c.objective}
                        onChange={(e) => onUpdateObjective(c.id, e.target.value as ObjectiveType)}
                        className="bg-[#1a1b20] text-neutral-200 border border-[#33353e] hover:border-amber-500/50 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-400 transition-all cursor-pointer"
                      >
                        {OBJ_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#141518] text-white">
                            {OBJ_LABELS[opt]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
