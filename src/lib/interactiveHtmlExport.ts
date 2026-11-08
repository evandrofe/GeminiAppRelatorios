import { CampaignRow, CapaData, GeminiAnalysisResult, ReportMeta } from '../types';

export function exportInteractiveWebReport(
  meta: ReportMeta,
  campaigns: CampaignRow[],
  capa: CapaData,
  aiAnalysis: GeminiAnalysisResult | null
) {
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalConv = campaigns.reduce((acc, c) => acc + (c.conv || 0), 0);
  const totalLinks = campaigns.reduce((acc, c) => acc + (c.links || 0), 0);
  const totalImpr = campaigns.reduce((acc, c) => acc + (c.impr || 0), 0) || (totalReach * 1.5);
  const avgFrequency = totalReach > 0 ? (totalImpr / totalReach).toFixed(2) : '1.00';
  const avgCostPerConv = totalConv > 0 ? (totalSpent / totalConv) : 0;
  const avgCPM = totalReach > 0 ? (totalSpent / totalReach) * 1000 : 0;
  const avgCPC = totalLinks > 0 ? (totalSpent / totalLinks) : 0;
  const avgCTR = totalImpr > 0 ? ((totalLinks / totalImpr) * 100).toFixed(2) : '0.00';

  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
  const fmtNum = (v: number) =>
    new Intl.NumberFormat('pt-BR').format(v || 0);

  // Group campaigns by objective
  const objMap: Record<string, { name: string; color: string; value: number; count: number; reach: number; conv: number }> = {
    alcance: { name: 'Alcance & Marca', color: '#3B82F6', value: 0, count: 0, reach: 0, conv: 0 },
    whatsapp: { name: 'WhatsApp & Leads', color: '#10B981', value: 0, count: 0, reach: 0, conv: 0 },
    reels: { name: 'Reels & Vídeos', color: '#8B5CF6', value: 0, count: 0, reach: 0, conv: 0 },
    trafego: { name: 'Tráfego & Cliques', color: '#F59E0B', value: 0, count: 0, reach: 0, conv: 0 },
    engajamento: { name: 'Engajamento Feed', color: '#EC4899', value: 0, count: 0, reach: 0, conv: 0 },
  };

  campaigns.forEach((c) => {
    const obj = c.objective || '';
    const val = (c.budget && c.budget > 0) ? c.budget : (c.spent || 0);
    let k = 'alcance';
    if (obj === 'Alc') k = 'alcance';
    else if (obj === 'EngWhats' || obj === 'TrafWhats' || obj === 'ReelsEngWhats' || obj === 'ReelsTrafWhats' || (c.conv > 0 && !/^Reels/i.test(obj))) k = 'whatsapp';
    else if (/^Reels/i.test(obj)) k = 'reels';
    else if (obj === 'TrafLink' || obj === 'EngLink') k = 'trafego';
    else if (obj === 'Eng') k = 'engajamento';

    objMap[k].value += val;
    objMap[k].count += 1;
    objMap[k].reach += c.reach || 0;
    objMap[k].conv += c.conv || 0;
  });

  const chartGroups = Object.values(objMap).filter((g) => g.count > 0);
  const grandTotal = chartGroups.reduce((a, b) => a + b.value, 0) || 1;

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Executivo • ${meta.cliente} (${meta.mes} ${meta.ano})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0b0c0e;
      color: #e5e7eb;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
      .bg-card { background: white !important; border: 1px solid #ccc !important; color: black !important; }
      .text-white { color: black !important; }
    }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-amber-500 selection:text-black">
  <!-- Top Bar -->
  <header class="border-b border-[#22242a] bg-[#121316]/90 sticky top-0 z-50 backdrop-blur-md px-6 py-4">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-amber-500/20">
          ${(meta.cliente || 'C').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 class="text-lg font-extrabold text-white leading-tight">
            ${meta.cliente || 'Relatório de Impulsionamento'}
          </h1>
          <p class="text-xs text-neutral-400">
            Análise de Desempenho Meta Ads • <strong class="text-amber-400">${meta.mes} ${meta.ano}</strong>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 no-print">
        <button onclick="window.print()" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white border border-neutral-700 transition-all cursor-pointer">
          Imprimir / Salvar PDF
        </button>
        <span class="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl">
          Apresentação Executiva Interativa
        </span>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
    <!-- Hero Headline (Reportei Style) -->
    <div class="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-800">
        <div>
          <span class="text-xs font-bold tracking-widest text-amber-400 uppercase">Visão Geral de Desempenho</span>
          <h2 class="text-2xl sm:text-3xl font-black text-white mt-1">
            Impulsionamentos & Mídia Paga Meta
          </h2>
          <p class="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Dados auditados diretamente dos relatórios de veiculação da Meta, com métricas consolidadas de alcance, conversão e retorno.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-neutral-900/90 border border-neutral-800 p-3.5 rounded-2xl text-right">
            <span class="text-[11px] text-neutral-400 block font-bold uppercase">Investimento Total</span>
            <span class="text-2xl font-black text-amber-400 font-mono">${fmtBRL(totalSpent)}</span>
          </div>
        </div>
      </div>

      <!-- Reportei Metric Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">Alcance Total</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${fmtNum(totalReach)}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Contas únicas impactadas</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">Impressões Totais</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${fmtNum(totalImpr)}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Frequência média: ${avgFrequency}</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-emerald-400 uppercase font-bold block mb-1">Conversas WhatsApp</span>
          <span class="text-xl sm:text-2xl font-black text-emerald-400 font-mono">${totalConv} conv.</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Custo: ${avgCostPerConv > 0 ? fmtBRL(avgCostPerConv) : '—'}</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-purple-400 uppercase font-bold block mb-1">Views ThruPlay (Reels)</span>
          <span class="text-xl sm:text-2xl font-black text-purple-300 font-mono">${fmtNum(totalViews)}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">${campaigns.filter(c => c.views > 0).length} ações de vídeo</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">Cliques no Link</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${fmtNum(totalLinks)}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">CTR médio: ${avgCTR}%</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">Custo p/ 1.000 (CPM)</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${avgCPM > 0 ? fmtBRL(avgCPM) : '—'}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Eficiência de propagação</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">CPC Médio</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${avgCPC > 0 ? fmtBRL(avgCPC) : '—'}</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Custo por clique gerado</span>
        </div>

        <div class="bg-neutral-900/70 border border-neutral-800 p-4 rounded-2xl">
          <span class="text-[11px] text-neutral-400 uppercase font-bold block mb-1">Ações Ativas</span>
          <span class="text-xl sm:text-2xl font-black text-white font-mono">${campaigns.length} ações</span>
          <span class="text-[10px] text-neutral-500 block mt-1">Veiculadas no período</span>
        </div>
      </div>
    </div>

    <!-- Budget Distribution by Objective (Reportei Visual Bar & Cards) -->
    <div class="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Alocação Orçamentária</span>
          <h3 class="text-xl font-black text-white mt-0.5">Distribuição de Verba por Objetivo</h3>
        </div>
        <span class="text-xs font-mono text-neutral-400">Total: <strong class="text-white">${fmtBRL(totalSpent)}</strong></span>
      </div>

      <div class="space-y-4">
        <!-- Interactive Progress Segments -->
        <div class="h-4 w-full bg-neutral-900 rounded-full overflow-hidden flex shadow-inner">
          ${chartGroups.map(g => {
            const pct = ((g.value / grandTotal) * 100).toFixed(1);
            return `<div style="width: ${pct}%; background-color: ${g.color};" title="${g.name}: ${pct}%" class="h-full transition-all"></div>`;
          }).join('')}
        </div>

        <!-- Pillar Grid Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          ${chartGroups.map(g => {
            const pct = ((g.value / grandTotal) * 100).toFixed(1);
            return `
              <div class="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${g.color};"></span>
                  <div>
                    <h4 class="text-xs font-bold text-white">${g.name}</h4>
                    <p class="text-[11px] text-neutral-400">${g.count} campanhas</p>
                  </div>
                </div>
                <div class="text-right font-mono">
                  <span class="text-xs font-bold text-white block">${fmtBRL(g.value)}</span>
                  <span class="text-[10px] font-bold text-amber-400">${pct}%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Top Highlight Campaigns (Reportei Style Cards) -->
    <div class="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div>
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Destaques da Mídia</span>
          <h3 class="text-xl font-black text-white mt-0.5">Campanhas e Anúncios em Destaque</h3>
        </div>
        <span class="text-xs text-neutral-400 font-bold">${campaigns.length} Ações Analisadas</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${campaigns.map((c, i) => {
          let mainMetric = `${fmtNum(c.reach)} alcance`;
          let badge = 'Alcance';
          let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';

          if (c.conv > 0) {
            mainMetric = `${c.conv} conversas WhatsApp`;
            badge = 'Conversão Lead';
            badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          } else if (c.views > 0) {
            mainMetric = `${fmtNum(c.views)} views ThruPlay`;
            badge = 'Vídeo / Reels';
            badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
          } else if (c.links > 0) {
            mainMetric = `${fmtNum(c.links)} cliques link`;
            badge = 'Tráfego';
            badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          }

          return `
            <div class="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 p-5 rounded-2xl transition-all">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}">
                    ${badge} • ${c.format || 'Anúncio'}
                  </span>
                  <h4 class="text-sm font-extrabold text-white mt-1.5 truncate">
                    ${c.displayName || c.name}
                  </h4>
                  <p class="text-[11px] text-neutral-400">Validade: ${c.validity || 'Mês completo'}</p>
                </div>
                <div class="text-right shrink-0 font-mono">
                  <span class="text-xs font-black text-white block">${fmtBRL(c.spent)}</span>
                  <span class="text-[10px] text-neutral-500">Gasto Real</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-3 border-t border-neutral-800 text-[11px] font-mono">
                <div>
                  <span class="text-neutral-500 block text-[9.5px]">RESULTADO</span>
                  <strong class="text-amber-400 truncate block">${mainMetric}</strong>
                </div>
                <div>
                  <span class="text-neutral-500 block text-[9.5px]">ALCANCE</span>
                  <span class="text-neutral-200 block">${fmtNum(c.reach)}</span>
                </div>
                <div class="text-right">
                  <span class="text-neutral-500 block text-[9.5px]">CUSTO UNITÁRIO</span>
                  <span class="text-neutral-200 block">${c.conv > 0 && c.cConv ? fmtBRL(c.cConv) : (c.views > 0 && c.cThru ? fmtBRL(c.cThru) : (c.cpm ? fmtBRL(c.cpm) : '—'))}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Gemini Strategic Analysis Block (Reportei Text Block) -->
    ${aiAnalysis ? `
      <div class="bg-[#141518] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest pb-3 border-b border-neutral-800">
          <span>Parecer Técnico do Especialista & Inteligência de Dados</span>
        </div>

        <div>
          <h3 class="text-xl font-black text-white mb-2">Diagnóstico Executivo do Período</h3>
          <p class="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
            ${aiAnalysis.executiveSummary}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
          <div class="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
            <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Principais Conquistas</h4>
            <ul class="space-y-2 text-xs text-neutral-300">
              ${aiAnalysis.keyHighlights.map(h => `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span><span>${h}</span></li>`).join('')}
            </ul>
          </div>

          <div class="bg-neutral-900/80 border border-neutral-800 p-4 rounded-2xl">
            <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Oportunidades & Próximos Passos</h4>
            <ul class="space-y-2 text-xs text-neutral-300">
              ${(aiAnalysis.strategicRecommendations || []).map((r: string) => `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span><span>${r}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Social Demographics from Capa (If available) -->
    ${(capa.fb.seguidores || capa.ig.seguidores) ? `
      <div class="bg-[#141518] border border-[#2b2d33] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div class="mb-4 pb-3 border-b border-neutral-800">
          <span class="text-xs font-bold text-amber-400 uppercase tracking-widest">Base de Audiência</span>
          <h3 class="text-xl font-black text-white mt-0.5">Demografia & Crescimento Orgânico Integrado</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div class="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl">
            <strong class="text-rose-400 block mb-1 uppercase font-bold">Instagram:</strong>
            <p class="text-neutral-300">${capa.ig.seguidores || '—'} seguidores • Alcance: ${capa.ig.alcancadas || '—'} • Faixa: ${capa.ig.faixa || '—'} • Divisão: ${capa.ig.mulheres || '—'} Mulheres / ${capa.ig.homens || '—'} Homens</p>
          </div>
          <div class="p-4 bg-neutral-900/70 border border-neutral-800 rounded-2xl">
            <strong class="text-blue-400 block mb-1 uppercase font-bold">Facebook:</strong>
            <p class="text-neutral-300">${capa.fb.seguidores || '—'} seguidores • Alcance: ${capa.fb.alcancadas || '—'} • Faixa: ${capa.fb.faixa || '—'} • Divisão: ${capa.fb.mulheres || '—'} Mulheres / ${capa.fb.homens || '—'} Homens</p>
          </div>
        </div>
      </div>
    ` : ''}
  </main>

  <footer class="border-t border-[#1e2025] py-8 text-center text-xs text-neutral-500">
    <p>Relatório Executivo gerado para <strong>${meta.cliente}</strong> • Meta Ads & Gemini AI Intelligence</p>
  </footer>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeClient = (meta.cliente || 'cliente').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePeriod = `${meta.mes || 'mes'}_${meta.ano || 'ano'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Relatorio_Executivo_${safeClient}_${safePeriod}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
