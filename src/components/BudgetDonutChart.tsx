import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector
} from 'recharts';
import { CampaignRow, ObjectiveType } from '../types';
import { PieChart as PieIcon, DollarSign, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

interface BudgetDonutChartProps {
  campaigns: CampaignRow[];
  title?: string;
  className?: string;
  showToggleMode?: boolean;
}

interface ObjectiveGroup {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  budget: number;
  spent: number;
  count: number;
  percent: number;
  reach: number;
  conv: number;
  views: number;
}

const COLOR_PALETTE = {
  alcance: { main: '#3B82F6', light: '#93C5FD' },      // Blue
  whatsapp: { main: '#10B981', light: '#A7F3D0' },     // Emerald
  reels: { main: '#8B5CF6', light: '#C4B5FD' },        // Purple
  trafego: { main: '#F59E0B', light: '#FDE68A' },      // Amber
  engajamento: { main: '#EC4899', light: '#FBCFE8' },  // Pink
  outros: { main: '#6B7280', light: '#E5E7EB' },       // Slate
};

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({
  campaigns,
  title = 'Distribuição de Orçamento por Objetivo',
  className = '',
  showToggleMode = true,
}) => {
  // Mode: 'budget' (Investimento Planejado) vs 'spent' (Valor Real Gasto)
  const [metricType, setMetricType] = useState<'budget' | 'spent'>('budget');
  // Grouping: 'macro' (Macro-Objetivos Estratégicos) vs 'detailed' (Objetivos Detalhados)
  const [viewLevel, setViewLevel] = useState<'macro' | 'detailed'>('macro');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  const fmtNum = (v: number) =>
    new Intl.NumberFormat('pt-BR').format(v || 0);

  // Calculate grouped data
  const chartData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];

    if (viewLevel === 'macro') {
      // 5 Strategic Macro Categories
      const groups: Record<string, ObjectiveGroup> = {
        alcance: {
          id: 'alcance',
          name: 'Alcance & Reconhecimento',
          shortName: 'Alcance',
          color: COLOR_PALETTE.alcance.main,
          secondaryColor: COLOR_PALETTE.alcance.light,
          budget: 0,
          spent: 0,
          count: 0,
          percent: 0,
          reach: 0,
          conv: 0,
          views: 0,
        },
        whatsapp: {
          id: 'whatsapp',
          name: 'Conversas WhatsApp (Leads)',
          shortName: 'WhatsApp',
          color: COLOR_PALETTE.whatsapp.main,
          secondaryColor: COLOR_PALETTE.whatsapp.light,
          budget: 0,
          spent: 0,
          count: 0,
          percent: 0,
          reach: 0,
          conv: 0,
          views: 0,
        },
        reels: {
          id: 'reels',
          name: 'Reels & Vídeos (Retenção)',
          shortName: 'Reels',
          color: COLOR_PALETTE.reels.main,
          secondaryColor: COLOR_PALETTE.reels.light,
          budget: 0,
          spent: 0,
          count: 0,
          percent: 0,
          reach: 0,
          conv: 0,
          views: 0,
        },
        trafego: {
          id: 'trafego',
          name: 'Tráfego & Cliques no Link',
          shortName: 'Tráfego',
          color: COLOR_PALETTE.trafego.main,
          secondaryColor: COLOR_PALETTE.trafego.light,
          budget: 0,
          spent: 0,
          count: 0,
          percent: 0,
          reach: 0,
          conv: 0,
          views: 0,
        },
        engajamento: {
          id: 'engajamento',
          name: 'Engajamento no Feed',
          shortName: 'Engajamento',
          color: COLOR_PALETTE.engajamento.main,
          secondaryColor: COLOR_PALETTE.engajamento.light,
          budget: 0,
          spent: 0,
          count: 0,
          percent: 0,
          reach: 0,
          conv: 0,
          views: 0,
        },
      };

      campaigns.forEach((c) => {
        const obj = (c.objective || '').trim();
        const effectiveBudget = (c.budget && c.budget > 0) ? c.budget : (c.spent || 0);
        const spent = c.spent || 0;

        let key = 'outros';
        if (obj === 'Alc') {
          key = 'alcance';
        } else if (
          obj === 'EngWhats' ||
          obj === 'TrafWhats' ||
          obj === 'ReelsEngWhats' ||
          obj === 'ReelsTrafWhats' ||
          (c.conv > 0 && !/^Reels/i.test(obj))
        ) {
          key = 'whatsapp';
        } else if (/^Reels/i.test(obj)) {
          key = 'reels';
        } else if (obj === 'TrafLink' || obj === 'EngLink') {
          key = 'trafego';
        } else if (obj === 'Eng') {
          key = 'engajamento';
        } else {
          key = 'alcance';
        }

        if (groups[key]) {
          groups[key].budget += effectiveBudget;
          groups[key].spent += spent;
          groups[key].count += 1;
          groups[key].reach += c.reach || 0;
          groups[key].conv += c.conv || 0;
          groups[key].views += c.views || 0;
        }
      });

      const list = Object.values(groups).filter((g) => g.count > 0);
      const totalVal = list.reduce(
        (acc, g) => acc + (metricType === 'budget' ? g.budget : g.spent),
        0
      );

      return list.map((g) => ({
        ...g,
        value: metricType === 'budget' ? g.budget : g.spent,
        percent: totalVal > 0 ? ((metricType === 'budget' ? g.budget : g.spent) / totalVal) * 100 : 0,
      })).sort((a, b) => b.value - a.value);

    } else {
      // Detailed by exact objective
      const objectiveMap: Record<ObjectiveType | string, { name: string; color: string }> = {
        Alc: { name: 'Alcance Direto', color: '#3B82F6' },
        EngWhats: { name: 'Engajamento WhatsApp', color: '#10B981' },
        TrafWhats: { name: 'Tráfego WhatsApp', color: '#059669' },
        TrafLink: { name: 'Tráfego Cliques Link', color: '#F59E0B' },
        EngLink: { name: 'Engajamento c/ Link', color: '#D97706' },
        Eng: { name: 'Engajamento Publicação', color: '#EC4899' },
        ReelsAlc: { name: 'Reels - Alcance', color: '#8B5CF6' },
        ReelsEng: { name: 'Reels - Engajamento', color: '#A855F7' },
        ReelsEngLink: { name: 'Reels - Link', color: '#7C3AED' },
        ReelsEngWhats: { name: 'Reels - WhatsApp Eng', color: '#047857' },
        ReelsTrafLink: { name: 'Reels - Tráfego Link', color: '#6D28D9' },
        ReelsTrafWhats: { name: 'Reels - WhatsApp Tráf', color: '#065F46' },
        indefinido: { name: 'Outro / Não classificado', color: '#6B7280' },
      };

      const groupDict: Record<string, ObjectiveGroup> = {};

      campaigns.forEach((c) => {
        const objKey = c.objective || 'indefinido';
        const info = objectiveMap[objKey] || { name: objKey, color: '#6B7280' };
        const effectiveBudget = (c.budget && c.budget > 0) ? c.budget : (c.spent || 0);

        if (!groupDict[objKey]) {
          groupDict[objKey] = {
            id: objKey,
            name: info.name,
            shortName: objKey,
            color: info.color,
            secondaryColor: '#E5E7EB',
            budget: 0,
            spent: 0,
            count: 0,
            percent: 0,
            reach: 0,
            conv: 0,
            views: 0,
          };
        }

        groupDict[objKey].budget += effectiveBudget;
        groupDict[objKey].spent += c.spent || 0;
        groupDict[objKey].count += 1;
        groupDict[objKey].reach += c.reach || 0;
        groupDict[objKey].conv += c.conv || 0;
        groupDict[objKey].views += c.views || 0;
      });

      const list = Object.values(groupDict);
      const totalVal = list.reduce(
        (acc, g) => acc + (metricType === 'budget' ? g.budget : g.spent),
        0
      );

      return list.map((g) => ({
        ...g,
        value: metricType === 'budget' ? g.budget : g.spent,
        percent: totalVal > 0 ? ((metricType === 'budget' ? g.budget : g.spent) / totalVal) * 100 : 0,
      })).sort((a, b) => b.value - a.value);
    }
  }, [campaigns, metricType, viewLevel]);

  // Overall sums
  const totalValue = useMemo(() => {
    return chartData.reduce((acc, item) => acc + item.value, 0);
  }, [chartData]);

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  // Render active shape on hover for executive polish
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ObjectiveGroup & { value: number } = payload[0].payload;
      return (
        <div className="bg-[#18191D] border border-neutral-700/80 rounded-xl p-3 shadow-2xl text-xs z-50 min-w-[210px] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-neutral-800">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white tracking-wide truncate">{data.name}</span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-neutral-400">
              <span>{metricType === 'budget' ? 'Orçamento:' : 'Valor Gasto:'}</span>
              <span className="font-bold text-white text-sm">{fmtBRL(data.value)}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Representação:</span>
              <span className="font-extrabold text-amber-400">
                {data.percent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-1 border-t border-neutral-800/80">
              <span>Campanhas:</span>
              <span className="text-neutral-200">{data.count} ações</span>
            </div>
            {data.reach > 0 && (
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>Alcance gerado:</span>
                <span className="text-blue-300">{fmtNum(data.reach)} pessoas</span>
              </div>
            )}
            {data.conv > 0 && (
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>Conversas Whats:</span>
                <span className="text-emerald-400 font-bold">{data.conv}</span>
              </div>
            )}
            {data.views > 0 && (
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>Visualizações:</span>
                <span className="text-purple-300">{fmtNum(data.views)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="p-8 text-center bg-[#141518] rounded-2xl border border-neutral-800 text-neutral-400 text-xs">
        Nenhuma campanha disponível para distribuição de orçamento.
      </div>
    );
  }

  return (
    <div
      className={`bg-[#141518] border border-[#2b2d33] rounded-2xl p-6 shadow-xl transition-all ${className}`}
    >
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <span>Visão Estratégica Executiva</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            {title}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Participação de cada pilar de marketing no montante total de{' '}
            <strong className="text-amber-400 font-mono">{fmtBRL(totalValue)}</strong>
          </p>
        </div>

        {showToggleMode && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Macro vs Detailed Switch */}
            <div className="bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setViewLevel('macro')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewLevel === 'macro'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Agrupa em Pilares Estratégicos (Alcance, WhatsApp, Reels, etc.)"
              >
                Macro-Pilares
              </button>
              <button
                type="button"
                onClick={() => setViewLevel('detailed')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewLevel === 'detailed'
                    ? 'bg-amber-500 text-neutral-950 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Visualiza cada objetivo individual do Meta Ads"
              >
                Detalhado
              </button>
            </div>

            {/* Budget vs Spent Switch */}
            <div className="bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setMetricType('budget')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricType === 'budget'
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Orçamento Programado / Investimento"
              >
                Orçamento
              </button>
              <button
                type="button"
                onClick={() => setMetricType('spent')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  metricType === 'spent'
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Valor Real Gasto na Veiculação"
              >
                Gasto Real
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Chart (Left) + Executive Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* DONUT CHART CONTAINER */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-full h-72 sm:h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                {React.createElement(Pie as any, {
                  data: chartData,
                  cx: "50%",
                  cy: "50%",
                  innerRadius: 72,
                  outerRadius: 105,
                  paddingAngle: 3,
                  dataKey: "value",
                  activeIndex: activeIndex !== null ? activeIndex : undefined,
                  activeShape: renderActiveShape,
                  onMouseEnter: (_: any, index: number) => setActiveIndex(index),
                  onMouseLeave: () => setActiveIndex(null),
                  isAnimationActive: true,
                  animationDuration: 800,
                }, chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#141518"
                    strokeWidth={2}
                    className="cursor-pointer transition-opacity duration-200"
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  />
                )))}
              </PieChart>
            </ResponsiveContainer>

            {/* Central Donut Hole Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {activeItem ? activeItem.shortName : (metricType === 'budget' ? 'Orçamento' : 'Gasto')} Total
              </span>
              <span className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                {fmtBRL(activeItem ? activeItem.value : totalValue)}
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full mt-1 border border-amber-500/20">
                {activeItem
                  ? `${activeItem.percent.toFixed(1)}% do total`
                  : `${campaigns.length} ações veiculadas`}
              </span>
            </div>
          </div>
        </div>

        {/* EXECUTIVE BREAKDOWN CARDS & METRICS (Right) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-3 pb-1 border-b border-neutral-800">
            <span>Objetivo / Pilar</span>
            <div className="flex items-center gap-6">
              <span className="w-20 text-right">Ações</span>
              <span className="w-24 text-right">Valor</span>
              <span className="w-14 text-right">Share (%)</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {chartData.map((item, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isHovered
                      ? 'bg-neutral-800/90 border-amber-500/50 shadow-lg scale-[1.01]'
                      : 'bg-neutral-900/60 border-neutral-800/70 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.percent >= 30 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        {item.reach > 0 && `${fmtNum(item.reach)} alcance`}
                        {item.conv > 0 && ` • ${item.conv} conversas`}
                        {item.views > 0 && ` • ${fmtNum(item.views)} views`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 font-mono text-xs">
                    <span className="w-20 text-right text-neutral-400 text-[11px]">
                      {item.count} {item.count === 1 ? 'campanha' : 'campanhas'}
                    </span>
                    <span className="w-24 text-right font-bold text-white">
                      {fmtBRL(item.value)}
                    </span>
                    <span className="w-14 text-right font-black text-amber-400 text-[11px] bg-amber-400/10 px-1.5 py-0.5 rounded">
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Insight Footer */}
          <div className="mt-3 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="text-white">Leitura Executiva do Orçamento: </strong>
              {chartData.length > 0 && (
                <>
                  O maior investimento do ciclo foi alocado em{' '}
                  <span className="font-bold text-amber-300">{chartData[0].name}</span> com{' '}
                  <span className="font-mono text-white font-semibold">
                    {fmtBRL(chartData[0].value)} ({chartData[0].percent.toFixed(1)}%)
                  </span>
                  {chartData.length > 1 && (
                    <>, seguido por <span className="text-white font-medium">{chartData[1].name}</span> com {chartData[1].percent.toFixed(1)}%</>
                  )}
                  . Essa distribuição equilibra reconhecimento institucional com geração direta de oportunidades de negócio.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
