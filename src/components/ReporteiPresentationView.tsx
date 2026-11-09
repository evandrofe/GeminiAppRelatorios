import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  MessageCircle,
  Video,
  MousePointerClick,
  FileSpreadsheet,
  Printer,
  Share2,
  Copy,
  Check,
  Download,
  Eye,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CampaignRow, CapaData, GeminiAnalysisResult, ReportMeta } from '../types';
import { BudgetDonutChart } from './BudgetDonutChart';
import { exportInteractiveWebReport } from '../lib/interactiveHtmlExport';
import { CapaModelView } from './CapaModelView';

interface ReporteiPresentationViewProps {
  meta: ReportMeta;
  campaigns: CampaignRow[];
  capa: CapaData;
  aiAnalysis: GeminiAnalysisResult | null;
  onGenerateAi: () => void;
  isGeneratingAi: boolean;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
}

export const ReporteiPresentationView: React.FC<ReporteiPresentationViewProps> = ({
  meta,
  campaigns,
  capa,
  aiAnalysis,
  onGenerateAi,
  isGeneratingAi,
  onExportExcel,
  isExportingExcel,
  isPresentationMode = false,
  onTogglePresentationMode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'conv' | 'reels' | 'alcance'>('all');

  // Formatting helpers
  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const fmtNum = (v: number) =>
    new Intl.NumberFormat('pt-BR').format(v || 0);

  // Consolidated Meta Ads Metrics
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalConv = campaigns.reduce((acc, c) => acc + (c.conv || 0), 0);
  const totalLinks = campaigns.reduce((acc, c) => acc + (c.links || 0), 0);
  const totalEng = campaigns.reduce((acc, c) => acc + (c.eng || 0), 0);
  const totalImpr = campaigns.reduce((acc, c) => acc + (c.impr || 0), 0) || Math.round(totalReach * 1.55);

  const avgFrequency = totalReach > 0 ? (totalImpr / totalReach).toFixed(2) : '1.00';
  const avgCostPerConv = totalConv > 0 ? totalSpent / totalConv : 0;
  const avgCPM = totalReach > 0 ? (totalSpent / totalReach) * 1000 : 0;
  const avgCPC = totalLinks > 0 ? totalSpent / totalLinks : 0;
  const avgCostPerView = totalViews > 0 ? totalSpent / totalViews : 0;
  const avgCTR = totalImpr > 0 ? ((totalLinks / totalImpr) * 100).toFixed(2) : '0.00';

  // Handle Copy shareable URL
  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'client');
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsapp = () => {
    if (!aiAnalysis?.clientMessageWhatsapp) return;
    navigator.clipboard.writeText(aiAnalysis.clientMessageWhatsapp);
    setCopiedWhatsapp(true);
    setTimeout(() => setCopiedWhatsapp(false), 2500);
  };

  const handleExportHtml = () => {
    exportInteractiveWebReport(meta, campaigns, capa, aiAnalysis);
  };

  // Prepare chart data for top campaigns
  const sortedBySpend = [...campaigns].sort((a, b) => b.spent - a.spent);
  const barChartData = sortedBySpend.slice(0, 6).map((c) => ({
    name: c.displayName || c.name.slice(0, 22),
    spent: c.spent,
    reach: c.reach,
    conv: c.conv,
  }));

  // Filtered campaigns for the Highlights grid
  const filteredCampaigns = campaigns.filter((c) => {
    if (filterType === 'conv') return c.conv > 0;
    if (filterType === 'reels') return /^Reels/i.test(c.objective) || c.views > 0;
    if (filterType === 'alcance') return c.objective === 'Alc' || (/alcance/i.test(c.name) && !c.conv);
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ======================================================================== */}
      {/* REPORTEI-STYLE EXECUTIVE BRAND HEADER */}
      {/* ======================================================================== */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle executive ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-800/80">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 shrink-0">
              <div className="w-full h-full bg-[#121316] rounded-[14px] flex items-center justify-center font-black text-amber-400 text-2xl tracking-tighter">
                {(meta.cliente || 'C').charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Relatório Executivo Meta Ads
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {meta.mes} {meta.ano}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Relatório de {meta.cliente || 'Cliente'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                Análise de Desempenho dos Anúncios e Campanhas Pagas • Base de dados oficial da Meta
              </p>
            </div>
          </div>

          {/* Action Toolbar (Share link, Download HTML, PDF, Presentation Mode) */}
          <div className="flex flex-wrap items-center gap-2.5 no-print">
            {/* Share Interactive Web Link Button */}
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-500/50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="Copiar link web interativo da apresentação para enviar ao cliente"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Link da Apresentação</span>
                </>
              )}
            </button>

            {/* Download Standalone Interactive HTML file */}
            <button
              onClick={handleExportHtml}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-500/50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="Baixar a apresentação inteira em um arquivo .html autônomo (não precisa de hospedagem, abre direto em qualquer navegador!)"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Baixar Web (.html)</span>
            </button>

            {/* PDF Print Button */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 hover:border-amber-500/50 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              title="Imprimir ou Salvar como PDF Executivo"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>PDF</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Baixar planilha oficial formatada com as 17 colunas"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExportingExcel ? 'Gerando...' : 'Planilha'}</span>
            </button>

            {/* Toggle Full Presentation Mode */}
            {onTogglePresentationMode && (
              <button
                onClick={onTogglePresentationMode}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isPresentationMode
                    ? 'bg-amber-500 text-neutral-950 font-black'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                }`}
                title={isPresentationMode ? 'Sair do Modo Apresentação' : 'Entrar no Modo Apresentação Limpa para o Cliente'}
              >
                {isPresentationMode ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Sair da Apresentação</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Modo Apresentação</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Capa Social Oficial de Redes Sociais Integrada */}
        <div className="mt-6 no-print">
          <details className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl overflow-hidden group">
            <summary className="p-3.5 sm:p-4 cursor-pointer flex items-center justify-between text-xs font-bold text-amber-300 hover:text-white transition-colors select-none">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
                <span>Ver Capa Social Oficial (Facebook & Instagram • Modelo Institucional)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full lowercase">
                  clique para ver a capa
                </span>
              </div>
              <span className="text-neutral-500 text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-3 sm:p-5 pt-0 bg-neutral-950">
              <CapaModelView meta={meta} capa={capa} />
            </div>
          </details>
        </div>

        {/* ======================================================================== */}
        {/* REPORTEI-STYLE 8-METRIC GRID (CONSOLIDATED PAID MEDIA RESULTS) */}
        {/* ======================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Valor Investido */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Valor Investido</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {fmtBRL(totalSpent)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
              <span>Orçamento: <strong className="text-neutral-300 font-mono">{fmtBRL(totalBudget)}</strong></span>
            </div>
          </div>

          {/* Card 2: Alcance Total */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Alcance Total</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {fmtNum(totalReach)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Contas únicas atingidas
            </div>
          </div>

          {/* Card 3: Impressões e Frequência */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Impressões Totais</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
              {fmtNum(totalImpr)}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Frequência média: <strong className="text-neutral-300 font-mono">{avgFrequency}</strong>
            </div>
          </div>

          {/* Card 4: Conversas WhatsApp */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-emerald-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Conversas WhatsApp</span>
              <MessageCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {totalConv > 0 ? `${totalConv} conv.` : '—'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Custo por conversa: <strong className="text-emerald-300 font-mono">{avgCostPerConv > 0 ? fmtBRL(avgCostPerConv) : '—'}</strong>
            </div>
          </div>

          {/* Card 5: Visualizações ThruPlay (Reels & Vídeos) */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Visualizações Vídeo (ThruPlay)</span>
              <Video className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalViews > 0 ? fmtNum(totalViews) : '—'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Custo por view: <strong className="text-purple-300 font-mono">{avgCostPerView > 0 ? fmtBRL(avgCostPerView) : '—'}</strong>
            </div>
          </div>

          {/* Card 6: Cliques no Link & CTR */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cliques no Link</span>
              <MousePointerClick className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {totalLinks > 0 ? fmtNum(totalLinks) : '—'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              CTR Médio: <strong className="text-amber-300 font-mono">{avgCTR}%</strong>
            </div>
          </div>

          {/* Card 7: CPM Médio (Custo por 1.000) */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Custo por 1.000 Contas</span>
              <TrendingUp className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {avgCPM > 0 ? fmtBRL(avgCPM) : '—'}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Eficiência geral de entrega
            </div>
          </div>

          {/* Card 8: Total de Ações Veiculadas */}
          <div className="bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-4 sm:p-5 hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between text-neutral-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Ações Veiculadas</span>
              <Layers className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {campaigns.length}
            </div>
            <div className="text-[11px] text-neutral-500 mt-1">
              Campanhas ativas no mês
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* SECTION: VISUAL CHARTS (DONUT BUDGET + COMPARATIVE CAMPAIGN BARS) */}
      {/* ======================================================================== */}
      <div className="space-y-6">
        {/* Gráfico de Rosca de Orçamento que o cliente adorou */}
        <BudgetDonutChart
          campaigns={campaigns}
          title="Distribuição Estratégica de Verba por Objetivo"
        />

        {/* Gráfico Comparativo: Principais Campanhas por Investimento e Alcance */}
        <div className="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-neutral-800">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Ranking de Investimento
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Comparativo de Campanhas: Investimento (R$) vs. Alcance
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              Top {barChartData.length} maiores ações do período
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#22242a" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" tickFormatter={(v) => `R$ ${v}`} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  width={150}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#18191D] border border-neutral-700 rounded-xl p-3 text-xs shadow-2xl font-mono">
                          <p className="font-bold text-white mb-1.5">{data.name}</p>
                          <p className="text-amber-400">Investimento: {fmtBRL(data.spent)}</p>
                          <p className="text-blue-400">Alcance: {fmtNum(data.reach)} pessoas</p>
                          {data.conv > 0 && (
                            <p className="text-emerald-400">Conversas: {data.conv} WhatsApp</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="spent" name="Investimento (R$)" fill="#f59e0b" radius={[0, 8, 8, 0]}>
                  {barChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#f59e0b' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ======================================================================== */}
      {/* SECTION: ANÚNCIOS E CAMPANHAS EM DESTAQUE (REPORTEI STYLE CARDS) */}
      {/* ======================================================================== */}
      <div className="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Performance Individual
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              Anúncios e Campanhas em Destaque
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Métricas detalhadas, custos unitários e formatos de cada anúncio pago
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs no-print">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Todas ({campaigns.length})
            </button>
            <button
              onClick={() => setFilterType('conv')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'conv'
                  ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              WhatsApp ({campaigns.filter((c) => c.conv > 0).length})
            </button>
            <button
              onClick={() => setFilterType('reels')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'reels'
                  ? 'bg-purple-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Reels ({campaigns.filter((c) => c.views > 0).length})
            </button>
            <button
              onClick={() => setFilterType('alcance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterType === 'alcance'
                  ? 'bg-blue-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Alcance
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCampaigns.map((c, index) => {
            const isTopConv = c.conv > 0 && c.conv >= Math.max(...campaigns.map((x) => x.conv));
            const isTopReach = c.reach >= Math.max(...campaigns.map((x) => x.reach));
            const isReels = /^Reels/i.test(c.objective) || c.views > 0;

            let badge = 'Alcance';
            let badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            let primaryResultLabel = 'ALCANCE';
            let primaryResultVal = fmtNum(c.reach);
            let unitCostLabel = 'CPM';
            let unitCostVal = c.cpm > 0 ? fmtBRL(c.cpm) : '—';

            if (c.conv > 0) {
              badge = 'WhatsApp Lead';
              badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
              primaryResultLabel = 'CONVERSAS';
              primaryResultVal = `${c.conv} iniciadas`;
              unitCostLabel = 'CUSTO / CONV.';
              unitCostVal = c.cConv > 0 ? fmtBRL(c.cConv) : '—';
            } else if (isReels) {
              badge = 'Reels / Vídeo';
              badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
              primaryResultLabel = 'THRUPLAY';
              primaryResultVal = `${fmtNum(c.views)} views`;
              unitCostLabel = 'CUSTO / VIEW';
              unitCostVal = c.cThru > 0 ? fmtBRL(c.cThru) : '—';
            } else if (c.links > 0) {
              badge = 'Tráfego Link';
              badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
              primaryResultLabel = 'CLIQUES LINK';
              primaryResultVal = `${fmtNum(c.links)} cliques`;
              unitCostLabel = 'CPC';
              unitCostVal = c.cpc > 0 ? fmtBRL(c.cpc) : '—';
            }

            return (
              <div
                key={c.id || index}
                className="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 p-5 rounded-2xl transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {badge}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        Formato: <strong className="text-neutral-200">{c.format || 'Anúncio'}</strong>
                      </span>
                      {isTopConv && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded">
                          ★ Campeão Conversões
                        </span>
                      )}
                      {isTopReach && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded">
                          ★ Maior Alcance
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-extrabold text-white group-hover:text-amber-400 transition-colors truncate">
                      {c.displayName || c.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Período de Veiculação: <span className="text-neutral-300">{c.validity || 'Mês vigente'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-sm font-black text-white block">
                      {fmtBRL(c.spent)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      Orçado: {fmtBRL(c.budget)}
                    </span>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-neutral-800 text-[11px] font-mono">
                  <div className="bg-neutral-950/50 p-2 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[9.5px] uppercase font-bold tracking-tight">
                      {primaryResultLabel}
                    </span>
                    <span className="text-amber-400 font-extrabold block truncate mt-0.5">
                      {primaryResultVal}
                    </span>
                  </div>

                  <div className="bg-neutral-950/50 p-2 rounded-xl border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[9.5px] uppercase font-bold tracking-tight">
                      ALCANCE ÚNICO
                    </span>
                    <span className="text-neutral-200 font-bold block truncate mt-0.5">
                      {fmtNum(c.reach)} contas
                    </span>
                  </div>

                  <div className="bg-neutral-950/50 p-2 rounded-xl border border-neutral-800/80 text-right">
                    <span className="text-neutral-500 block text-[9.5px] uppercase font-bold tracking-tight">
                      {unitCostLabel}
                    </span>
                    <span className="text-white font-black block truncate mt-0.5">
                      {unitCostVal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================================== */}
      {/* SECTION: PARECER TÉCNICO & ANÁLISE DO GESTOR COM IA GEMINI */}
      {/* ======================================================================== */}
      <div className="bg-[#141518] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Inteligência de Dados & Consultoria
              </span>
              <h3 className="text-xl font-black text-white mt-0.5">
                Parecer Técnico do Especialista (Análise Executiva)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!aiAnalysis ? (
              <button
                onClick={onGenerateAi}
                disabled={isGeneratingAi}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gerando com Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Parecer com IA Gemini</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onGenerateAi}
                disabled={isGeneratingAi}
                className="text-xs text-neutral-400 hover:text-white bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-xl border border-neutral-800 transition-colors cursor-pointer"
              >
                {isGeneratingAi ? 'Atualizando...' : 'Recalcular Análise'}
              </button>
            )}
          </div>
        </div>

        {aiAnalysis ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Diagnóstico Geral do Mês
              </h4>
              <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-line font-normal bg-neutral-900/60 border border-neutral-800 p-5 rounded-2xl">
                {aiAnalysis.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/60 border border-emerald-500/30 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Principais Conquistas do Ciclo</span>
                </div>
                <ul className="space-y-2.5">
                  {aiAnalysis.keyHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-neutral-900/60 border border-amber-500/30 p-5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Oportunidades & Próximos Passos de Mídia</span>
                </div>
                <ul className="space-y-2.5">
                  {(aiAnalysis.strategicRecommendations || []).map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick WhatsApp Executive Message Card */}
            {aiAnalysis.clientMessageWhatsapp && (
              <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <MessageCircle className="w-4 h-4" />
                    <span>Mensagem Executiva para Envio no WhatsApp do Cliente</span>
                  </div>
                  <button
                    onClick={handleCopyWhatsapp}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
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
                <p className="text-xs text-neutral-300 font-mono bg-black/40 p-4 rounded-xl whitespace-pre-line border border-neutral-800/80">
                  {aiAnalysis.clientMessageWhatsapp}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-900/40 rounded-2xl border border-neutral-800/80 p-6">
            <p className="text-xs text-neutral-400 max-w-lg mx-auto mb-4">
              Clique em <strong>"Gerar Parecer com IA Gemini"</strong> acima para gerar uma síntese estratégica completa
              com diagnóstico de mídia, vitórias do mês, recomendações e mensagem pronta para o cliente.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================================== */}
      {/* SECTION: AUDIÊNCIA E DEMOGRAFIA (QUANDO PREENCHIDO NA CAPA SOCIAL) */}
      {/* ======================================================================== */}
      {(capa.fb.seguidores || capa.ig.seguidores) && (
        <div className="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6 pb-4 border-b border-neutral-800">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Base de Audiência Social
            </span>
            <h3 className="text-xl font-black text-white mt-0.5">
              Demografia e Presença Orgânica Integrada
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram Card */}
            <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <strong className="text-rose-400 text-sm font-bold uppercase">Instagram Business</strong>
                <span className="text-xs font-mono font-bold text-white">{capa.ig.seguidores || '—'} seguidores</span>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Alcance Orgânico/Total:</span>
                  <span>{capa.ig.alcancadas || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Visitas ao Perfil:</span>
                  <span>{capa.ig.visitas || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Faixa Etária Principal:</span>
                  <span>{capa.ig.faixa || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Divisão de Gênero:</span>
                  <span className="text-rose-300">{capa.ig.mulheres || '—'} Mulheres / {capa.ig.homens || '—'} Homens</span>
                </div>
              </div>
            </div>

            {/* Facebook Card */}
            <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <strong className="text-blue-400 text-sm font-bold uppercase">Facebook Page</strong>
                <span className="text-xs font-mono font-bold text-white">{capa.fb.seguidores || '—'} seguidores</span>
              </div>
              <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Alcance Total:</span>
                  <span>{capa.fb.alcancadas || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Visitas à Página:</span>
                  <span>{capa.fb.visitas || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Faixa Etária Principal:</span>
                  <span>{capa.fb.faixa || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Divisão de Gênero:</span>
                  <span className="text-blue-300">{capa.fb.mulheres || '—'} Mulheres / {capa.fb.homens || '—'} Homens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
