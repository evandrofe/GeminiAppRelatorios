import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Sparkles,
  BarChart3,
  Table as TableIcon,
  MessageSquare,
  Bot,
  Copy,
  Check,
  Send,
  TrendingUp,
  DollarSign,
  Users,
  MessageCircle,
  Video,
  MousePointerClick,
  Info,
  ChevronRight,
  Lightbulb,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  CampaignRow,
  CapaData,
  ChatMessage,
  GeminiAnalysisResult,
  ReportMeta
} from '../types';
import {
  categorizeCampaignPillars,
  extractDateFromName
} from '../lib/metaAdsParser';

interface StepReportProps {
  meta: ReportMeta;
  campaigns: CampaignRow[];
  capa: CapaData;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  onBackToCapa: () => void;
}

export const StepReport: React.FC<StepReportProps> = ({
  meta,
  campaigns,
  capa,
  onExportExcel,
  isExportingExcel,
  onBackToCapa,
}) => {
  const [activeTab, setActiveTab] = useState<'segmented' | 'table' | 'dashboard' | 'ai' | 'chat'>('segmented');
  const [aiAnalysis, setAiAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  // Categorize campaigns into the 3 specific strategic pillars
  const pillars = categorizeCampaignPillars(campaigns);

  // Pillar totals
  const totalAlcGasto = pillars.alcance.reduce((acc, c) => acc + c.spent, 0);
  const totalAlcInvestimento = pillars.alcance.reduce((acc, c) => acc + c.budget, 0);
  const totalAlcAlcance = pillars.alcance.reduce((acc, c) => acc + c.reach, 0);
  const cpmMedioAlc = totalAlcAlcance > 0 ? (totalAlcGasto / totalAlcAlcance) * 1000 : 0;

  const totalEngGasto = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.spent, 0);
  const totalEngInvestimento = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.budget, 0);
  const totalEngAlcance = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.reach, 0);
  const totalEngConv = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.conv, 0);
  const totalEngLinks = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.links, 0);
  const totalEngInt = pillars.engajamentoTrafego.reduce((acc, c) => acc + c.eng, 0);
  const custoMedioConv = totalEngConv > 0 ? totalEngGasto / totalEngConv : 0;
  const cpcMedioEng = totalEngLinks > 0 ? totalEngGasto / totalEngLinks : 0;
  const custoMedioIntEng = totalEngInt > 0 ? totalEngGasto / totalEngInt : 0;

  const totalReelsGasto = pillars.reels.reduce((acc, c) => acc + c.spent, 0);
  const totalReelsInvestimento = pillars.reels.reduce((acc, c) => acc + c.budget, 0);
  const totalReelsAlcance = pillars.reels.reduce((acc, c) => acc + c.reach, 0);
  const totalReelsViews = pillars.reels.reduce((acc, c) => acc + c.views, 0);
  const totalReelsConv = pillars.reels.reduce((acc, c) => acc + c.conv, 0);
  const totalReelsLinks = pillars.reels.reduce((acc, c) => acc + c.links, 0);
  const totalReelsInt = pillars.reels.reduce((acc, c) => acc + c.eng, 0);
  const custoMedioView = totalReelsViews > 0 ? totalReelsGasto / totalReelsViews : 0;

  // Grand totals
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalConv = campaigns.reduce((acc, c) => acc + (c.conv || 0), 0);
  const totalLinks = campaigns.reduce((acc, c) => acc + (c.links || 0), 0);
  const totalInt = campaigns.reduce((acc, c) => acc + (c.eng || 0), 0);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: `Olá! Sou seu Especialista em Tráfego Pago e Análise Meta Ads com IA. Tenho acesso completo a todas as métricas deste relatório do cliente ${meta.cliente || 'Cliente'}. Você pode me perguntar quais criativos renderam melhor, como otimizar o orçamento ou pedir justificativas de resultados!`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Formatting helpers
  const fmtBRL = (v: number) =>
    typeof v === 'number' && v > 0
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
      : '-';

  const fmtNum = (v: number) =>
    typeof v === 'number' && v > 0
      ? new Intl.NumberFormat('pt-BR').format(v)
      : '-';

  const titleCase = (str: string) => {
    if (!str) return str;
    return String(str)
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
  };

  // Trigger Gemini Analysis
  const handleGenerateAiAnalysis = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    setAiNotice(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta, campaigns, capa }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar análise executiva.');
      }
      setAiAnalysis(data.data);
      if (data.notice) {
        setAiNotice(data.notice);
      }
      setActiveTab('ai');
    } catch (err: any) {
      setAiError(err.message || 'Falha ao comunicar com o serviço de IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyWhatsapp = () => {
    if (!aiAnalysis?.clientMessageWhatsapp) return;
    navigator.clipboard.writeText(aiAnalysis.clientMessageWhatsapp);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          context: {
            meta,
            campaigns,
            capa,
            totals: {
              spent: totalSpent,
              budget: totalBudget,
              reach: totalReach,
              links: totalLinks,
              views: totalViews,
              conv: totalConv,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro no chat');
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'gemini',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'gemini',
        text: 'Desculpe, ocorreu uma instabilidade ao responder. Verifique sua chave no painel de Secrets ou tente novamente.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  let lastDateKey = '';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Top Banner & Tab Controls */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 mb-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Passo 4 de 4
            </span>
            <span className="text-xs text-neutral-400">Relatório Executivo & Análise de IA</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {meta.cliente || 'Relatório de Impulsionamento'}{' '}
            <span className="text-neutral-400 font-normal text-lg">
              ({meta.mes} {meta.ano})
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Total Gasto: <strong className="text-white font-mono">{fmtBRL(totalSpent)}</strong> •{' '}
            Alcance Total: <strong className="text-white font-mono">{fmtNum(totalReach)}</strong> contas •{' '}
            Conversas WhatsApp: <strong className="text-emerald-400 font-mono">{totalConv}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Trigger Button */}
          {!aiAnalysis && (
            <button
              onClick={handleGenerateAiAnalysis}
              disabled={isGeneratingAi}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Gerando Análise Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Análise Executiva com IA</span>
                </>
              )}
            </button>
          )}

          {/* Excel Export Button */}
          <button
            onClick={onExportExcel}
            disabled={isExportingExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? 'Gerando Planilha...' : 'Baixar Excel (.xlsx)'}</span>
          </button>

          {/* Dedicated PDF Download Button */}
          <button
            onClick={handlePrintPdf}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-950/40 flex items-center gap-2 cursor-pointer"
            title="Baixar ou Imprimir o PDF Executivo formatado no padrão Gemini"
          >
            <Printer className="w-4 h-4" />
            <span>Baixar / Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* View Mode Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#2b2d33] pb-3 overflow-x-auto no-print">
        <button
          onClick={() => setActiveTab('segmented')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'segmented'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Padrão Segmentado por Pilar (Gemini)</span>
          <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-bold">Novo</span>
        </button>

        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'table'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Planilha Unificada Tradicional</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Visual de KPIs</span>
        </button>

        <button
          onClick={() => {
            if (!aiAnalysis) handleGenerateAiAnalysis();
            else setActiveTab('ai');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Análise Executiva Gemini IA</span>
          {aiAnalysis && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Consultor Especialista (Chat)</span>
        </button>
      </div>

      {/* ======================================================================== */}
      {/* TAB: REFINED GEMINI SEGMENTED PRESENTATION (DEFAULT FOR SCREEN AND PDF) */}
      {/* ======================================================================== */}
      {(activeTab === 'segmented' || typeof window !== 'undefined') && (
        <div className={`space-y-8 ${activeTab !== 'segmented' ? 'hidden print:block' : ''}`}>
          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block mb-6 border-b border-neutral-300 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
                  Relatório Executivo de Impulsionamento Meta Ads
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Cliente: <strong className="text-neutral-900">{meta.cliente}</strong> • Período:{' '}
                  <strong className="text-neutral-900">{meta.mes} {meta.ano}</strong>
                </p>
              </div>
              <div className="text-right text-[10px] text-neutral-500">
                <span>Processado com inteligência artificial Gemini</span>
                <span className="block">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {/* Print Cover demographic summary */}
            {(capa.fb.seguidores || capa.ig.seguidores) && (
              <div className="grid grid-cols-2 gap-3 mt-4 text-[10px] bg-neutral-100 p-2.5 rounded border border-neutral-200">
                <div>
                  <strong className="text-blue-900 uppercase">Facebook:</strong> {capa.fb.seguidores || '—'} seguidores • Alcance: {capa.fb.alcancadas || '—'} • Visitas: {capa.fb.visitas || '—'} • Faixa: {capa.fb.faixa || '—'}
                </div>
                <div>
                  <strong className="text-rose-900 uppercase">Instagram:</strong> {capa.ig.seguidores || '—'} seguidores • Alcance: {capa.ig.alcancadas || '—'} • Visitas: {capa.ig.visitas || '—'} • Faixa: {capa.ig.faixa || '—'}
                </div>
              </div>
            )}
          </div>

          {/* Notice Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-200 no-print">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>17 Colunas Originais Preservadas:</strong> Todas as 17 colunas da planilha oficial (de <em>Nome da Ação</em> até <em>Conversas Iniciadas</em>) estão ativas e visíveis, estruturadas estrategicamente por Pilares (Alcance, Engajamento/WhatsApp e Reels) com destaques, subtotais automáticos e consolidação geral.
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase">
              17 Colunas Completas
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PILAR 1: CAMPANHAS COM OBJETIVO DE ALCANCE (17 COLUNAS) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-xl border border-neutral-800 overflow-hidden text-neutral-950 print-avoid-break">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide">
                    1. Campanhas com Objetivo de Alcance (Reconhecimento & Distribuição)
                  </h3>
                  <p className="text-[11px] text-blue-100/90 font-medium">
                    Foco em propagação de marca, frequência e alcance massivo de pessoas • 17 Colunas Originais
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="bg-white/20 px-2.5 py-1 rounded-full font-bold">
                  {pillars.alcance.length} ações
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] font-sans">
                <thead>
                  <tr className="bg-neutral-200 text-neutral-900 font-bold uppercase tracking-tight text-[8.5px]">
                    <th className="py-2.5 px-3 border-r border-b border-neutral-300 text-left min-w-[200px]">1. Nome da Ação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">2. Formato</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">3. Validade</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">4. Investimento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">5. Valor Gasto</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-blue-100 text-blue-950 font-black">6. Alcance</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">7. Engajamento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">8. Cliques Link</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">9. ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-blue-100 text-blue-950 font-black">10. Custo / 1.000</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">11. Custo / Clique</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">12. Custo / ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">13. Custo / Interação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">14. Custo / Conversa</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">15. Filtro</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">16. Cidade</th>
                    <th className="py-2.5 px-2 border-b border-neutral-300 text-right whitespace-nowrap">17. Conversas</th>
                  </tr>
                </thead>
                <tbody>
                  {pillars.alcance.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-4 text-center text-neutral-500 italic">
                        Nenhuma campanha categorizada exclusivamente como alcance no período.
                      </td>
                    </tr>
                  ) : (
                    pillars.alcance.map((c) => {
                      const isDuplicateReach = c.reach > 0 && c.eng === c.reach;
                      const engVal = isDuplicateReach ? '—' : (c.eng > 0 ? fmtNum(c.eng) : '—');
                      return (
                        <tr key={c.id} className="hover:bg-blue-50/40 border-b border-neutral-200 transition-colors">
                          <td className="py-2 px-3 border-r border-neutral-200 text-left font-semibold text-neutral-900">
                            {titleCase(c.displayName || c.name)}
                            {c.aiNotes && (
                              <span className="block text-[8.5px] text-blue-700 font-normal mt-0.5 no-print">
                                {c.aiNotes}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-700 whitespace-nowrap">{c.format}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-600 whitespace-nowrap">{c.validity || '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono">{fmtBRL(c.budget)}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-950 font-bold whitespace-nowrap font-mono">{fmtBRL(c.spent)}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right font-black text-blue-950 whitespace-nowrap font-mono bg-blue-50/60">{fmtNum(c.reach)}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{engVal}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.links > 0 ? fmtNum(c.links) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.views > 0 ? fmtNum(c.views) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right font-bold text-blue-900 whitespace-nowrap font-mono bg-blue-50/60">{c.cpm > 0 ? fmtBRL(c.cpm) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cpc > 0 ? fmtBRL(c.cpc) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cThru > 0 ? fmtBRL(c.cThru) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cInt > 0 ? fmtBRL(c.cInt) : '—'}</td>
                          <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cConv > 0 ? fmtBRL(c.cConv) : '—'}</td>
                          <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.filtro || '—'}</td>
                          <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.cidade || '—'}</td>
                          <td className="py-2 px-2 border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.conv > 0 ? fmtNum(c.conv) : '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {pillars.alcance.length > 0 && (
                  <tfoot>
                    <tr className="bg-blue-100/90 font-black text-blue-950 border-t-2 border-blue-400 text-[9.5px]">
                      <td colSpan={3} className="py-2.5 px-3 border-r border-blue-200 text-left uppercase">
                        Subtotal Alcance ({pillars.alcance.length} ações)
                      </td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-right font-mono">{fmtBRL(totalAlcInvestimento)}</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-right font-mono text-neutral-950">{fmtBRL(totalAlcGasto)}</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-right font-mono text-blue-950">{fmtNum(totalAlcAlcance)}</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-right font-mono text-blue-900">{fmtBRL(cpmMedioAlc)}</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-1.5 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-1.5 border-r border-blue-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-blue-200 text-center text-neutral-500 font-mono">—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PILAR 2: CAMPANHAS DE ENGAJAMENTO E TRÁFEGO (17 COLUNAS) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-xl border border-neutral-800 overflow-hidden text-neutral-950 print-avoid-break">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide">
                    2. Campanhas de Engajamento e Tráfego (WhatsApp, Conversas e Links)
                  </h3>
                  <p className="text-[11px] text-emerald-100/90 font-medium">
                    Foco em gerar mensagens diretas, interações qualificadas e tráfego de destino • 17 Colunas Originais
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="bg-white/20 px-2.5 py-1 rounded-full font-bold">
                  {pillars.engajamentoTrafego.length} ações
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] font-sans">
                <thead>
                  <tr className="bg-neutral-200 text-neutral-900 font-bold uppercase tracking-tight text-[8.5px]">
                    <th className="py-2.5 px-3 border-r border-b border-neutral-300 text-left min-w-[200px]">1. Nome da Ação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">2. Formato</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">3. Validade</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">4. Investimento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">5. Valor Gasto</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">6. Alcance</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">7. Engajamento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">8. Cliques Link</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">9. ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">10. Custo / 1.000</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">11. Custo / Clique</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">12. Custo / ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">13. Custo / Interação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">14. Custo / Conversa</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">15. Filtro</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">16. Cidade</th>
                    <th className="py-2.5 px-2 border-b border-neutral-300 text-right whitespace-nowrap bg-emerald-100 text-emerald-950 font-black">17. Conversas</th>
                  </tr>
                </thead>
                <tbody>
                  {pillars.engajamentoTrafego.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-4 text-center text-neutral-500 italic">
                        Nenhuma campanha nesta categoria no período.
                      </td>
                    </tr>
                  ) : (
                    pillars.engajamentoTrafego.map((c) => (
                      <tr key={c.id} className="hover:bg-emerald-50/40 border-b border-neutral-200 transition-colors">
                        <td className="py-2 px-3 border-r border-neutral-200 text-left font-semibold text-neutral-900">
                          {titleCase(c.displayName || c.name)}
                          {c.aiNotes && (
                            <span className="block text-[8.5px] text-emerald-700 font-normal mt-0.5 no-print">
                              {c.aiNotes}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-700 whitespace-nowrap">{c.format}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-600 whitespace-nowrap">{c.validity || '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono">{fmtBRL(c.budget)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-950 font-bold whitespace-nowrap font-mono">{fmtBRL(c.spent)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{fmtNum(c.reach)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono bg-emerald-50/40">{c.eng > 0 ? fmtNum(c.eng) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono bg-emerald-50/40">{c.links > 0 ? fmtNum(c.links) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.views > 0 ? fmtNum(c.views) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cpm > 0 ? fmtBRL(c.cpm) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono bg-emerald-50/40">{c.cpc > 0 ? fmtBRL(c.cpc) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cThru > 0 ? fmtBRL(c.cThru) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono bg-emerald-50/40">{c.cInt > 0 ? fmtBRL(c.cInt) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right font-bold text-emerald-800 whitespace-nowrap font-mono bg-emerald-50/50">{c.cConv > 0 ? fmtBRL(c.cConv) : '—'}</td>
                        <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.filtro || '—'}</td>
                        <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.cidade || '—'}</td>
                        <td className="py-2 px-2 border-neutral-200 text-right font-black text-emerald-950 whitespace-nowrap font-mono bg-emerald-50/60">{c.conv > 0 ? `${c.conv} conv.` : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {pillars.engajamentoTrafego.length > 0 && (
                  <tfoot>
                    <tr className="bg-emerald-100/90 font-black text-emerald-950 border-t-2 border-emerald-400 text-[9.5px]">
                      <td colSpan={3} className="py-2.5 px-3 border-r border-emerald-200 text-left uppercase">
                        Subtotal Engajamento & Tráfego ({pillars.engajamentoTrafego.length} ações)
                      </td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono">{fmtBRL(totalEngInvestimento)}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono text-neutral-950">{fmtBRL(totalEngGasto)}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono">{fmtNum(totalEngAlcance)}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono">{fmtNum(totalEngInt)}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono">{fmtNum(totalEngLinks)}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono text-emerald-900">{cpcMedioEng > 0 ? fmtBRL(cpcMedioEng) : '—'}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono text-emerald-900">{custoMedioIntEng > 0 ? fmtBRL(custoMedioIntEng) : '—'}</td>
                      <td className="py-2.5 px-2 border-r border-emerald-200 text-right font-mono text-emerald-900">{custoMedioConv > 0 ? fmtBRL(custoMedioConv) : '—'}</td>
                      <td className="py-2.5 px-1.5 border-r border-emerald-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-1.5 border-r border-emerald-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-emerald-200 text-right font-mono text-emerald-950">{totalEngConv > 0 ? `${totalEngConv} conv.` : '—'}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* PILAR 3: CAMPANHAS DE REELS E VÍDEOS (17 COLUNAS) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-xl border border-neutral-800 overflow-hidden text-neutral-950 print-avoid-break">
            <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide">
                    3. Campanhas de Reels e Vídeos (Retenção Audiovisual & ThruPlay)
                  </h3>
                  <p className="text-[11px] text-purple-100/90 font-medium">
                    Métricas de consumo de vídeo, alcance dinâmico de Reels e custo por retenção • 17 Colunas Originais
                  </p>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="bg-white/20 px-2.5 py-1 rounded-full font-bold">
                  {pillars.reels.length} ações
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] font-sans">
                <thead>
                  <tr className="bg-neutral-200 text-neutral-900 font-bold uppercase tracking-tight text-[8.5px]">
                    <th className="py-2.5 px-3 border-r border-b border-neutral-300 text-left min-w-[200px]">1. Nome da Ação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">2. Formato</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">3. Validade</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">4. Investimento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">5. Valor Gasto</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-purple-100 text-purple-950 font-black">6. Alcance</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">7. Engajamento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">8. Cliques Link</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-purple-100 text-purple-950 font-black">9. ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">10. Custo / 1.000</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">11. Custo / Clique</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap bg-purple-100 text-purple-950 font-black">12. Custo / ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">13. Custo / Interação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">14. Custo / Conversa</th>
                    <th className="py-2.5 px-1.5 border-r border-neutral-300 text-center whitespace-nowrap">15. Filtro</th>
                    <th className="py-2.5 px-1.5 border-r border-neutral-300 text-center whitespace-nowrap">16. Cidade</th>
                    <th className="py-2.5 px-2 border-b border-neutral-300 text-right whitespace-nowrap bg-purple-100 text-purple-950 font-black">17. Conversas</th>
                  </tr>
                </thead>
                <tbody>
                  {pillars.reels.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="py-4 text-center text-neutral-500 italic">
                        Nenhuma campanha de Reels veiculada no período.
                      </td>
                    </tr>
                  ) : (
                    pillars.reels.map((c) => (
                      <tr key={c.id} className="hover:bg-purple-50/40 border-b border-neutral-200 transition-colors">
                        <td className="py-2 px-3 border-r border-neutral-200 text-left font-semibold text-neutral-900">
                          {titleCase(c.displayName || c.name)}
                          {c.aiNotes && (
                            <span className="block text-[8.5px] text-purple-700 font-normal mt-0.5 no-print">
                              {c.aiNotes}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-700 whitespace-nowrap">{c.format}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-600 whitespace-nowrap">{c.validity || '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-800 whitespace-nowrap font-mono">{fmtBRL(c.budget)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-950 font-bold whitespace-nowrap font-mono">{fmtBRL(c.spent)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{fmtNum(c.reach)}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.eng > 0 ? fmtNum(c.eng) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.links > 0 ? fmtNum(c.links) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right font-black text-purple-900 whitespace-nowrap font-mono bg-purple-50/50">{c.views > 0 ? fmtNum(c.views) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cpm > 0 ? fmtBRL(c.cpm) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cpc > 0 ? fmtBRL(c.cpc) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right font-bold text-purple-800 whitespace-nowrap font-mono bg-purple-50/50">{c.cThru > 0 ? fmtBRL(c.cThru) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cInt > 0 ? fmtBRL(c.cInt) : '—'}</td>
                        <td className="py-2 px-2 border-r border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.cConv > 0 ? fmtBRL(c.cConv) : '—'}</td>
                        <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.filtro || '—'}</td>
                        <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-500 whitespace-nowrap">{c.cidade || '—'}</td>
                        <td className="py-2 px-2 border-neutral-200 text-right text-neutral-700 whitespace-nowrap font-mono">{c.conv > 0 ? `${c.conv} conv.` : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {pillars.reels.length > 0 && (
                  <tfoot>
                    <tr className="bg-purple-100/90 font-black text-purple-950 border-t-2 border-purple-400 text-[9.5px]">
                      <td colSpan={3} className="py-2.5 px-3 border-r border-purple-200 text-left uppercase">
                        Subtotal Reels & Vídeos ({pillars.reels.length} ações)
                      </td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono">{fmtBRL(totalReelsInvestimento)}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono text-neutral-950">{fmtBRL(totalReelsGasto)}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono">{fmtNum(totalReelsAlcance)}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono">{fmtNum(totalReelsInt)}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono">{totalReelsLinks > 0 ? fmtNum(totalReelsLinks) : '—'}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono text-purple-950">{fmtNum(totalReelsViews)}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-right font-mono text-purple-900">{custoMedioView > 0 ? fmtBRL(custoMedioView) : '—'}</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-1.5 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-1.5 border-r border-purple-200 text-center text-neutral-500 font-mono">—</td>
                      <td className="py-2.5 px-2 border-purple-200 text-right font-mono">{totalReelsConv > 0 ? `${totalReelsConv} conv.` : '—'}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* RESUMO CONSOLIDADO DOS TRÊS PILARES (17 COLUNAS COMPLETAS) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl shadow-xl border border-neutral-800 overflow-hidden text-neutral-950 print-avoid-break">
            <div className="bg-[#FF9900] text-white px-5 py-2.5 font-black text-xs uppercase tracking-wider text-center">
              Consolidação Total do Período • Matriz de 17 Colunas Completas
            </div>

            {/* Quick KPI Cards */}
            <div className="p-4 bg-amber-50/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b border-amber-200 font-sans">
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Investido</span>
                <span className="text-base font-black text-neutral-900 font-mono">{fmtBRL(totalSpent)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Alcance Total</span>
                <span className="text-base font-black text-blue-900 font-mono">{fmtNum(totalReach)}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Conversas Whats</span>
                <span className="text-base font-black text-emerald-800 font-mono">{totalConv} conversas</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block">Visualizações Reels</span>
                <span className="text-base font-black text-purple-900 font-mono">{fmtNum(totalViews)}</span>
              </div>
            </div>

            {/* Full 17-column Consolidated Grand Total Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10px] font-sans">
                <thead>
                  <tr className="bg-neutral-200 text-neutral-900 font-bold uppercase tracking-tight text-[8.5px]">
                    <th className="py-2.5 px-3 border-r border-b border-neutral-300 text-left min-w-[200px]">1. Pilar / Consolidação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">2. Formato</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-center whitespace-nowrap">3. Validade</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">4. Investimento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">5. Valor Gasto</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">6. Alcance</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">7. Engajamento</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">8. Cliques Link</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">9. ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">10. Custo / 1.000</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">11. Custo / Clique</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">12. Custo / ThruPlay</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">13. Custo / Interação</th>
                    <th className="py-2.5 px-2 border-r border-b border-neutral-300 text-right whitespace-nowrap">14. Custo / Conversa</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">15. Filtro</th>
                    <th className="py-2.5 px-1.5 border-r border-b border-neutral-300 text-center whitespace-nowrap">16. Cidade</th>
                    <th className="py-2.5 px-2 border-b border-neutral-300 text-right whitespace-nowrap">17. Conversas</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row Pilar 1 */}
                  <tr className="hover:bg-neutral-50 border-b border-neutral-200">
                    <td colSpan={3} className="py-2 px-3 border-r border-neutral-200 font-bold text-blue-900 text-left">
                      Pilar 1: Alcance ({pillars.alcance.length} ações)
                    </td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtBRL(totalAlcInvestimento)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-neutral-950 font-bold">{fmtBRL(totalAlcGasto)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-blue-950 font-bold">{fmtNum(totalAlcAlcance)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-blue-900">{fmtBRL(cpmMedioAlc)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                  </tr>

                  {/* Row Pilar 2 */}
                  <tr className="hover:bg-neutral-50 border-b border-neutral-200">
                    <td colSpan={3} className="py-2 px-3 border-r border-neutral-200 font-bold text-emerald-900 text-left">
                      Pilar 2: Engajamento & Tráfego ({pillars.engajamentoTrafego.length} ações)
                    </td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtBRL(totalEngInvestimento)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-neutral-950 font-bold">{fmtBRL(totalEngGasto)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtNum(totalEngAlcance)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtNum(totalEngInt)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtNum(totalEngLinks)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{cpcMedioEng > 0 ? fmtBRL(cpcMedioEng) : '—'}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{custoMedioIntEng > 0 ? fmtBRL(custoMedioIntEng) : '—'}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-emerald-900 font-bold">{custoMedioConv > 0 ? fmtBRL(custoMedioConv) : '—'}</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-neutral-200 text-right font-mono text-emerald-900 font-bold">{totalEngConv > 0 ? `${totalEngConv} conv.` : '—'}</td>
                  </tr>

                  {/* Row Pilar 3 */}
                  <tr className="hover:bg-neutral-50 border-b border-neutral-200">
                    <td colSpan={3} className="py-2 px-3 border-r border-neutral-200 font-bold text-purple-900 text-left">
                      Pilar 3: Reels & Vídeos ({pillars.reels.length} ações)
                    </td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtBRL(totalReelsInvestimento)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-neutral-950 font-bold">{fmtBRL(totalReelsGasto)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtNum(totalReelsAlcance)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{fmtNum(totalReelsInt)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono">{totalReelsLinks > 0 ? fmtNum(totalReelsLinks) : '—'}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-purple-950 font-bold">{fmtNum(totalReelsViews)}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-right font-mono text-purple-900 font-bold">{custoMedioView > 0 ? fmtBRL(custoMedioView) : '—'}</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-1.5 border-r border-neutral-200 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-2 px-2 border-neutral-200 text-right font-mono">{totalReelsConv > 0 ? `${totalReelsConv} conv.` : '—'}</td>
                  </tr>
                </tbody>

                <tfoot>
                  <tr className="bg-amber-100 font-black text-neutral-950 border-t-2 border-amber-500 text-[10px]">
                    <td colSpan={3} className="py-3 px-3 border-r border-amber-300 text-left uppercase">
                      TOTAL GERAL CONSOLIDADO ({campaigns.length} campanhas)
                    </td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{fmtBRL(totalBudget)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono text-neutral-950 font-black">{fmtBRL(totalSpent)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono text-blue-950">{fmtNum(totalReach)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{fmtNum(totalInt)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{fmtNum(totalLinks)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono text-purple-950">{fmtNum(totalViews)}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{totalReach > 0 ? fmtBRL((totalSpent / totalReach) * 1000) : '—'}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{totalLinks > 0 ? fmtBRL(totalSpent / totalLinks) : '—'}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{totalViews > 0 ? fmtBRL(totalSpent / totalViews) : '—'}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono">{totalInt > 0 ? fmtBRL(totalSpent / totalInt) : '—'}</td>
                    <td className="py-3 px-2 border-r border-amber-300 text-right font-mono text-emerald-950">{totalConv > 0 ? fmtBRL(totalSpent / totalConv) : '—'}</td>
                    <td className="py-3 px-1.5 border-r border-amber-300 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-3 px-1.5 border-r border-amber-300 text-center text-neutral-400 font-mono">—</td>
                    <td className="py-3 px-2 border-amber-300 text-right font-mono text-emerald-950 font-black">{totalConv > 0 ? `${totalConv} conv.` : '—'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Raio-X dos Resultados */}
            <div className="p-5 bg-white text-xs text-neutral-700 leading-relaxed border-t border-neutral-200">
              <strong className="block text-neutral-900 font-bold mb-1 uppercase tracking-wide text-[10px]">
                Raio-X Técnico dos Indicadores de Performance (17 Colunas):
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10.5px] mt-2">
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                  <strong className="text-blue-900 block mb-0.5">Pilar 1 - Alcance:</strong>
                  Mede a amplitude e impacto de marca. As colunas 6 (Alcance) e 10 (Custo por 1.000 pessoas) são os focos centrais. Em ações de alcance, o engajamento não duplica o alcance.
                </div>
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                  <strong className="text-emerald-900 block mb-0.5">Pilar 2 - Conversas & Tráfego:</strong>
                  Focado em conversões diretas no WhatsApp (col. 17), custo por conversa (col. 14), cliques no link (col. 8) e CPC (col. 11), aferindo a geração ativa de leads.
                </div>
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                  <strong className="text-purple-900 block mb-0.5">Pilar 3 - Reels & Vídeos:</strong>
                  Focado na retenção audiovisual. As visualizações ThruPlay (col. 9) e custo por ThruPlay (col. 12) avaliam os vídeos com retenção de 15 segundos ou visualização completa.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 2: TRADITIONAL UNIFIED TABLE (17 COLUMNS) */}
      {/* ======================================================================== */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-2xl border border-neutral-800 overflow-hidden text-neutral-950">
            <div className="bg-[#FF9900] text-white text-center py-2.5 font-bold text-sm tracking-wider uppercase border-b border-black">
              AÇÕES MENSAIS (MATRIZ UNIFICADA)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[10.5px] font-sans">
                <thead>
                  <tr className="bg-[#B7B7B7] text-neutral-950 font-bold uppercase tracking-tight text-[9px]">
                    <th className="py-2.5 px-3 border-r border-b border-black text-left whitespace-nowrap min-w-[200px]">
                      Nome da Ação
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Formato
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Validade
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Investimento
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Valor Gasto
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Alcance
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Engajamento
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Cliques no Link
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Visualização (ThruPlay)
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Custo por 1.000 Pessoas
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Custo por Cliques Link
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Custo por ThruPlay
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Custo por Interação
                    </th>
                    <th className="py-2.5 px-2 border-r border-b border-black text-center whitespace-nowrap">
                      Custo por Conversa
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-b border-black text-center whitespace-nowrap">
                      Filtro
                    </th>
                    <th className="py-2.5 px-1.5 border-r border-b border-black text-center whitespace-nowrap">
                      Cidade
                    </th>
                    <th className="py-2.5 px-2 border-b border-black text-center whitespace-nowrap">
                      Conversas Iniciadas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((r, idx) => {
                    const o = r.objective;
                    const isReels = /^Reels/i.test(o);
                    const curDate = extractDateFromName(r.name) || (r.sortDate ? new Date(r.sortDate) : null);
                    const curDateKey = curDate ? curDate.getTime() : 'none';

                    const showSeparator = idx > 0 && curDateKey !== lastDateKey;
                    lastDateKey = String(curDateKey);

                    const colReach = fmtNum(r.reach);
                    const colEng =
                      o === 'Eng' || o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEng' || o === 'ReelsEngLink' || o === 'ReelsTrafLink' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats'
                        ? fmtNum(r.eng)
                        : '-';
                    const colLinks =
                      o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink'
                        ? fmtNum(r.links)
                        : '-';
                    const colViews = isReels ? fmtNum(r.views) : '-';
                    const colCPM = o === 'Alc' ? fmtBRL(r.cpm) : '-';
                    const colCPC =
                      o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink'
                        ? fmtBRL(r.cpc)
                        : '-';
                    const colThru =
                      o === 'ReelsAlc' || o === 'ReelsEng' || o === 'ReelsEngLink' || o === 'ReelsTrafLink'
                        ? fmtBRL(r.cThru)
                        : '-';
                    const colCInt = o === 'Eng' || o === 'ReelsEng' ? fmtBRL(r.cInt) : '-';
                    const colCConv =
                      o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats'
                        ? fmtBRL(r.cConv)
                        : '-';
                    const colConv =
                      o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats'
                        ? fmtNum(r.conv)
                        : '-';

                    return (
                      <React.Fragment key={r.id}>
                        {showSeparator && (
                          <tr className="bg-neutral-100 border-y border-neutral-300 h-3">
                            <td colSpan={17} className="h-3 p-0" />
                          </tr>
                        )}
                        <tr className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-2 px-3 border-r border-b border-neutral-200 text-left font-medium">
                            {titleCase(r.displayName || r.name)}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap text-neutral-700">
                            {r.format}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap text-neutral-600">
                            {r.validity || '-'}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {fmtBRL(r.budget)}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap font-bold text-neutral-900">
                            {fmtBRL(r.spent)}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colReach}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colEng}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colLinks}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colViews}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colCPM}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colCPC}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colThru}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colCInt}
                          </td>
                          <td className="py-2 px-2 border-r border-b border-neutral-200 text-center whitespace-nowrap">
                            {colCConv}
                          </td>
                          <td className="py-2 px-1.5 border-r border-b border-neutral-200 text-center text-neutral-400">
                            -
                          </td>
                          <td className="py-2 px-1.5 border-r border-b border-neutral-200 text-center text-neutral-400">
                            -
                          </td>
                          <td className="py-2 px-2 border-b border-neutral-200 text-center whitespace-nowrap font-bold text-emerald-700">
                            {colConv}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 3: VISUAL DASHBOARD */}
      {/* ======================================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Investido</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">{fmtBRL(totalSpent)}</div>
              <p className="text-[11px] text-neutral-500 mt-1">Orçado: {fmtBRL(totalBudget)}</p>
            </div>

            <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Alcance Total</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white font-mono">{fmtNum(totalReach)}</div>
              <p className="text-[11px] text-neutral-500 mt-1">Contas únicas atingidas</p>
            </div>

            <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Conversas Whats</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">{totalConv}</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Custo Médio: {custoMedioConv > 0 ? fmtBRL(custoMedioConv) : '-'}
              </p>
            </div>

            <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Visualizações ThruPlay</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-300 font-mono">{fmtNum(totalViews)}</div>
              <p className="text-[11px] text-neutral-500 mt-1">Custo Médio: {custoMedioView > 0 ? fmtBRL(custoMedioView) : '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 4: GEMINI AI EXECUTIVE ANALYSIS */}
      {/* ======================================================================== */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {aiError && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-3 text-red-200 text-xs">
              <div>
                <strong className="text-red-300 block font-semibold mb-0.5">Aviso da API Gemini</strong>
                <span>{aiError}</span>
              </div>
              <button
                onClick={handleGenerateAiAnalysis}
                disabled={isGeneratingAi}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shrink-0 cursor-pointer"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {aiNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block font-semibold mb-0.5">Modo Otimizado Ativo</strong>
                <span>{aiNotice}</span>
              </div>
            </div>
          )}

          {!aiAnalysis ? (
            <div className="text-center py-16 bg-[#141518] border border-[#2b2d33] rounded-3xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Análise Executiva com Inteligência Artificial</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                Clique no botão abaixo para o Gemini avaliar o desempenho do mês, listar conquistas, pontos de atenção,
                redigir a mensagem do WhatsApp do cliente e propor os próximos passos de mídia.
              </p>
              <button
                onClick={handleGenerateAiAnalysis}
                disabled={isGeneratingAi}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processando Relatório com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Análise Completa Agora</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#141518] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Resumo Executivo para a Diretoria</span>
                  </div>
                  <button
                    onClick={handleGenerateAiAnalysis}
                    disabled={isGeneratingAi}
                    className="text-[10px] text-neutral-400 hover:text-white bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {isGeneratingAi ? 'Atualizando...' : 'Recalcular Análise'}
                  </button>
                </div>
                <h3 className="text-xl font-black text-white mb-3">
                  Avaliação Geral de Desempenho • {meta.cliente}
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line font-normal">
                  {aiAnalysis.executiveSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#141518] border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <span>Principais Conquistas do Período</span>
                  </div>
                  <ul className="space-y-3">
                    {aiAnalysis.keyHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#141518] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
                    <Info className="w-4 h-4" />
                    <span>Pontos de Otimização & Atenção</span>
                  </div>
                  <ul className="space-y-3">
                    {aiAnalysis.pointsOfAttention.map((pa, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-200">
                        <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{pa}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#141518] border border-emerald-500/40 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4" />
                    <span>Mensagem Pronta de WhatsApp para o Cliente</span>
                  </div>
                  <button
                    onClick={handleCopyWhatsapp}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedWhatsapp ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Mensagem</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-[#1a1b20] border border-[#2b2d33] rounded-xl p-4 text-xs text-neutral-200 font-sans whitespace-pre-wrap leading-relaxed">
                  {aiAnalysis.clientMessageWhatsapp}
                </div>
              </div>

              <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-4">
                  <Lightbulb className="w-4 h-4" />
                  <span>Recomendações Estratégicas para o Próximo Mês</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {aiAnalysis.strategicRecommendations.map((rec, i) => (
                    <div key={i} className="bg-[#1a1b20] p-4 rounded-xl border border-[#2b2d33] text-xs text-neutral-300 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================== */}
      {/* TAB 5: TRAFFIC COPILOT CHAT */}
      {/* ======================================================================== */}
      {activeTab === 'chat' && (
        <div className="bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-2xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-4 border-b border-[#26282f] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Especialista em Tráfego Gemini
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Responde com precisão baseado nos dados carregados de {meta.cliente || 'seu cliente'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isUser ? 'EU' : <Sparkles className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                        : 'bg-[#1a1b20] text-neutral-200 border border-[#2e3037] rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.text}
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        isUser ? 'text-neutral-900/70 text-right' : 'text-neutral-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-[#1a1b20] text-neutral-400 border border-[#2e3037] rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                  <span>Consultor Gemini analisando dados...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="pt-4 border-t border-[#26282f] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pergunte sobre as campanhas, melhor criativo, ROI, sugestões..."
              className="flex-1 bg-[#1a1b20] border border-[#2e3037] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
