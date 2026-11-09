import ExcelJS from 'exceljs';
import { CampaignRow, CapaData, ReportMeta } from '../types';
import { categorizeCampaignPillars, OBJ_LABELS } from './metaAdsParser';

export async function exportToExcel(
  meta: ReportMeta,
  campaigns: CampaignRow[],
  capa: CapaData
): Promise<void> {
  const C = {
    gold: 'FFFBBC04',
    goldDark: 'FFD97706',
    orange: 'FFFF9900',
    dark: 'FF181A20',
    charcoal: 'FF26282F',
    slate: 'FF334155',
    blueHead: 'FF1E3A8A',
    blueSubBg: 'FFE0E7FF',
    greenHead: 'FF065F46',
    greenSubBg: 'FFD1FAE5',
    purpleHead: 'FF5B21B6',
    purpleSubBg: 'FFEDE9FE',
    totalBg: 'FFFFEDD5',
    cardHeader: 'FFF1F5F9',
    cardBg: 'FFFFFFFF',
    gray1: 'FFB7B7B7',
    grayLight: 'FFF8FAFC',
    borderGray: 'FFE2E8F0',
    white: 'FFFFFFFF',
    black: 'FF000000',
    separator: 'FFF3F4F6'
  };

  const bkThin: ExcelJS.Border = { style: 'thin', color: { argb: 'FFD1D5DB' } };
  const bkDark: ExcelJS.Border = { style: 'thin', color: { argb: C.black } };
  const bAll: Partial<ExcelJS.Borders> = { top: bkThin, bottom: bkThin, left: bkThin, right: bkThin };
  const bAllDark: Partial<ExcelJS.Borders> = { top: bkDark, bottom: bkDark, left: bkDark, right: bkDark };

  const fl = (argb: string): ExcelJS.Fill => ({
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb }
  });

  const fn = (
    bold = false,
    size = 10,
    argb = C.black,
    name = 'Calibri'
  ): Partial<ExcelJS.Font> => ({
    bold: !!bold,
    size: size || 10,
    color: { argb: argb || C.black },
    name: name || 'Calibri'
  });

  const al = (
    h: ExcelJS.Alignment['horizontal'] = 'center',
    v: ExcelJS.Alignment['vertical'] = 'middle',
    wrapText = false
  ): Partial<ExcelJS.Alignment> => ({
    horizontal: h,
    vertical: v,
    wrapText: !!wrapText
  });

  const BRL = 'R$\\ #,##0.00';
  const NUM = '#,##0';
  const PCT = '0.00%';

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Relatório de Impulsionamento Meta Ads & Gemini AI';
  wb.created = new Date();

  // Consolidação de métricas globais para todas as pastas
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalConv = campaigns.reduce((acc, c) => acc + (c.conv || 0), 0);
  const totalLinks = campaigns.reduce((acc, c) => acc + (c.links || 0), 0);
  const totalEng = campaigns.reduce((acc, c) => acc + (c.eng || 0), 0);
  const totalImpr = campaigns.reduce((acc, c) => acc + (c.impr || 0), 0) || Math.round(totalReach * 1.55);

  const avgFrequency = totalReach > 0 ? totalImpr / totalReach : 1;
  const avgCostPerConv = totalConv > 0 ? totalSpent / totalConv : 0;
  const avgCPM = totalReach > 0 ? (totalSpent / totalReach) * 1000 : 0;
  const avgCPC = totalLinks > 0 ? totalSpent / totalLinks : 0;
  const avgCostPerView = totalViews > 0 ? totalSpent / totalViews : 0;
  const avgCTR = totalImpr > 0 ? totalLinks / totalImpr : 0;

  const pillars = categorizeCampaignPillars(campaigns);

  // ═════════════════════════════════════════════════════════════════════════
  // PASTA 1: CAPA SOCIAL (Capa Dourada Institucional)
  // ═════════════════════════════════════════════════════════════════════════
  const wsCapa = wb.addWorksheet('Capa Social');
  const titulo = `${(meta.cliente || 'CLIENTE').toUpperCase()} - ${(meta.mes || 'MÊS').toUpperCase()} - ${meta.ano || 'ANO'}`;
  const G = fl(C.gold);

  wsCapa.columns = [
    { width: 3 },
    { width: 3 },
    { width: 22 },
    { width: 3 },
    { width: 17 },
    { width: 17 },
    { width: 3 },
    { width: 4 },
    { width: 3 },
    { width: 22 },
    { width: 3 },
    { width: 17 },
    { width: 17 },
    { width: 3 },
    { width: 3 },
    { width: 3 }
  ];

  for (let ri = 1; ri <= 16; ri++) {
    const rw = wsCapa.getRow(ri);
    for (let ci = 1; ci <= 16; ci++) {
      rw.getCell(ci).fill = G;
    }
  }

  // Row 1: Título Principal
  wsCapa.mergeCells('A1:P1');
  wsCapa.getRow(1).height = 42;
  const cTit = wsCapa.getCell('A1');
  cTit.value = 'RELATÓRIO DE TRÁFEGO PAGO';
  cTit.fill = G;
  cTit.font = fn(true, 24, C.black, 'Arial');
  cTit.alignment = al('center', 'middle');

  // Row 2: Subtítulo Período & Cliente
  wsCapa.mergeCells('A2:P2');
  wsCapa.getRow(2).height = 20;
  const cSub = wsCapa.getCell('A2');
  cSub.value = `MÊS DE ${(meta.mes || 'MÊS').toUpperCase()} - ${meta.ano || 'ANO'}${meta.cliente ? ` • ${meta.cliente.toUpperCase()}` : ''}`;
  cSub.fill = G;
  cSub.font = fn(true, 11, C.black, 'Arial');
  cSub.alignment = al('center', 'middle');

  // Row 3: Cabeçalhos Facebook / Instagram
  wsCapa.getRow(3).height = 24;
  wsCapa.mergeCells('C3:G3');
  wsCapa.mergeCells('J3:N3');
  const cFB = wsCapa.getCell('C3');
  cFB.value = 'FACEBOOK';
  cFB.fill = G;
  cFB.font = fn(true, 13, C.black, 'Arial');
  cFB.alignment = al('center', 'middle');

  const cIG = wsCapa.getCell('J3');
  cIG.value = 'INSTAGRAM';
  cIG.fill = G;
  cIG.font = fn(true, 13, C.black, 'Arial');
  cIG.alignment = al('center', 'middle');

  wsCapa.getRow(4).height = 6;

  // Row 5-6: Total seguidores
  wsCapa.getRow(5).height = 30;
  wsCapa.getRow(6).height = 30;
  wsCapa.mergeCells('C5:G6');
  wsCapa.mergeCells('J5:N6');
  const cFBSeg = wsCapa.getCell('C5');
  cFBSeg.value = `Total de ${capa.fb.seguidores || '—'} seguidores`;
  cFBSeg.fill = G;
  cFBSeg.font = fn(false, 19, C.black, 'Arial');
  cFBSeg.alignment = al('center', 'middle', true);

  const cIGSeg = wsCapa.getCell('J5');
  cIGSeg.value = `Total de ${capa.ig.seguidores || '—'} seguidores`;
  cIGSeg.fill = G;
  cIGSeg.font = fn(false, 19, C.black, 'Arial');
  cIGSeg.alignment = al('center', 'middle', true);

  // Row 7: Seguidores mês anterior
  wsCapa.getRow(7).height = 22;
  wsCapa.mergeCells('C7:G7');
  wsCapa.mergeCells('J7:N7');
  const cFBSA = wsCapa.getCell('C7');
  cFBSA.value = `${capa.fb.segAnterior || '—'} seguidores no mês anterior`;
  cFBSA.fill = G;
  cFBSA.font = fn(true, 12, C.black, 'Arial');
  cFBSA.alignment = al('center', 'middle', true);

  const cIGSA = wsCapa.getCell('J7');
  cIGSA.value = `${capa.ig.segAnterior || '—'} seguidores no mês anterior`;
  cIGSA.fill = G;
  cIGSA.font = fn(true, 12, C.black, 'Arial');
  cIGSA.alignment = al('center', 'middle', true);

  wsCapa.getRow(8).height = 8;

  // Row 9-10: Gênero
  const pct = (v: string) => {
    const s = String(v || '').trim();
    return s ? (s.endsWith('%') ? s : `${s} %`) : '—';
  };

  wsCapa.getRow(9).height = 28;
  wsCapa.getRow(10).height = 28;
  wsCapa.mergeCells('C9:D10');
  wsCapa.mergeCells('E9:F10');
  wsCapa.mergeCells('J9:K10');
  wsCapa.mergeCells('L9:M10');

  const cFBH = wsCapa.getCell('C9');
  cFBH.value = `${pct(capa.fb.homens)} Homens`;
  cFBH.fill = G;
  cFBH.font = fn(true, 15, C.black, 'Arial');
  cFBH.alignment = al('center', 'middle');

  const cFBM = wsCapa.getCell('E9');
  cFBM.value = `${pct(capa.fb.mulheres)} Mulheres`;
  cFBM.fill = G;
  cFBM.font = fn(true, 15, C.black, 'Arial');
  cFBM.alignment = al('center', 'middle');

  const cIGH = wsCapa.getCell('J9');
  cIGH.value = `${pct(capa.ig.homens)} Homens`;
  cIGH.fill = G;
  cIGH.font = fn(true, 15, C.black, 'Arial');
  cIGH.alignment = al('center', 'middle');

  const cIGM = wsCapa.getCell('L9');
  cIGM.value = `${pct(capa.ig.mulheres)} Mulheres`;
  cIGM.fill = G;
  cIGM.font = fn(true, 15, C.black, 'Arial');
  cIGM.alignment = al('center', 'middle');

  wsCapa.getRow(11).height = 8;

  // Row 12-13: Valores métricas principais
  wsCapa.getRow(12).height = 32;
  wsCapa.getRow(13).height = 32;
  wsCapa.mergeCells('C12:D13');
  wsCapa.mergeCells('E12:E13');
  wsCapa.mergeCells('F12:F13');
  wsCapa.mergeCells('J12:K13');
  wsCapa.mergeCells('L12:L13');
  wsCapa.mergeCells('M12:M13');

  const cFBF = wsCapa.getCell('C12');
  cFBF.value = capa.fb.faixa || '—';
  cFBF.fill = G;
  cFBF.font = fn(true, 18, C.black, 'Arial');
  cFBF.alignment = al('center', 'middle');

  const cFBA = wsCapa.getCell('E12');
  cFBA.value = capa.fb.alcancadas || '—';
  cFBA.fill = G;
  cFBA.font = fn(true, 20, C.black, 'Arial');
  cFBA.alignment = al('center', 'middle');

  const cFBV = wsCapa.getCell('F12');
  cFBV.value = capa.fb.visitas || '—';
  cFBV.fill = G;
  cFBV.font = fn(true, 20, C.black, 'Arial');
  cFBV.alignment = al('center', 'middle');

  const cIGF = wsCapa.getCell('J12');
  cIGF.value = capa.ig.faixa || '—';
  cIGF.fill = G;
  cIGF.font = fn(true, 18, C.black, 'Arial');
  cIGF.alignment = al('center', 'middle');

  const cIGA = wsCapa.getCell('L12');
  cIGA.value = capa.ig.alcancadas || '—';
  cIGA.fill = G;
  cIGA.font = fn(true, 20, C.black, 'Arial');
  cIGA.alignment = al('center', 'middle');

  const cIGV = wsCapa.getCell('M12');
  cIGV.value = capa.ig.visitas || '—';
  cIGV.fill = G;
  cIGV.font = fn(true, 20, C.black, 'Arial');
  cIGV.alignment = al('center', 'middle');

  // Row 14: Rótulos das métricas
  wsCapa.getRow(14).height = 20;
  wsCapa.mergeCells('C14:D14');
  const lFBF = wsCapa.getCell('C14');
  lFBF.value = 'FAIXA ETÁRIA';
  lFBF.fill = G;
  lFBF.font = fn(false, 10.5, C.black, 'Arial');
  lFBF.alignment = al('center', 'middle');

  const lFBA = wsCapa.getCell('E14');
  lFBA.value = 'CONTAS ALCANÇADAS';
  lFBA.fill = G;
  lFBA.font = fn(false, 10.5, C.black, 'Arial');
  lFBA.alignment = al('center', 'middle', true);

  const lFBV = wsCapa.getCell('F14');
  lFBV.value = 'VISITAS À PÁGINA';
  lFBV.fill = G;
  lFBV.font = fn(false, 10.5, C.black, 'Arial');
  lFBV.alignment = al('center', 'middle', true);

  wsCapa.mergeCells('J14:K14');
  const lIGF = wsCapa.getCell('J14');
  lIGF.value = 'FAIXA ETÁRIA';
  lIGF.fill = G;
  lIGF.font = fn(false, 10.5, C.black, 'Arial');
  lIGF.alignment = al('center', 'middle');

  const lIGA = wsCapa.getCell('L14');
  lIGA.value = 'CONTAS ALCANÇADAS';
  lIGA.fill = G;
  lIGA.font = fn(false, 10.5, C.black, 'Arial');
  lIGA.alignment = al('center', 'middle', true);

  const lIGV = wsCapa.getCell('M14');
  lIGV.value = 'VISITAS AO PERFIL';
  lIGV.fill = G;
  lIGV.font = fn(false, 10.5, C.black, 'Arial');
  lIGV.alignment = al('center', 'middle', true);

  // Row 16: Rodapé Institucional
  wsCapa.mergeCells('C16:N16');
  wsCapa.getRow(16).height = 24;
  const cLogo = wsCapa.getCell('C16');
  cLogo.value = 'creative comunicação';
  cLogo.fill = G;
  cLogo.font = fn(true, 11, C.black, 'Arial');
  cLogo.alignment = al('center', 'middle');

  // ═════════════════════════════════════════════════════════════════════════
  // PASTA 2: APRESENTAÇÃO DESTAQUE (Visão Executiva com Cards de KPIs)
  // ═════════════════════════════════════════════════════════════════════════
  const wsDest = wb.addWorksheet('Apresentação Destaque');
  wsDest.columns = [
    { width: 5 },   // A: Margem
    { width: 28 },  // B: Card 1 / Nome Ação
    { width: 14 },  // C: Formato
    { width: 22 },  // D: Objetivo
    { width: 16 },  // E: Validade
    { width: 16 },  // F: Valor Gasto
    { width: 16 },  // G: Alcance
    { width: 16 },  // H: Resultado Principal
    { width: 16 },  // I: Custo Resultado
    { width: 16 },  // J: Filtro
    { width: 16 }   // K: Cidade
  ];

  // Cabeçalho Principal Executivo
  wsDest.mergeCells('B2:K2');
  wsDest.getRow(2).height = 36;
  const cDestHead = wsDest.getCell('B2');
  cDestHead.value = `APRESENTAÇÃO DESTAQUE • RELATÓRIO EXECUTIVO DE MÍDIA PAGA`;
  cDestHead.fill = fl(C.dark);
  cDestHead.font = fn(true, 14, C.white);
  cDestHead.alignment = al('center', 'middle');

  wsDest.mergeCells('B3:K3');
  wsDest.getRow(3).height = 20;
  const cDestSub = wsDest.getCell('B3');
  cDestSub.value = `Cliente: ${meta.cliente || 'Cliente'}  |  Período: ${meta.mes || ''} ${meta.ano || ''}  |  Inteligência Meta Ads & Gemini AI`;
  cDestSub.fill = fl(C.charcoal);
  cDestSub.font = fn(false, 10, C.gold);
  cDestSub.alignment = al('center', 'middle');

  // Seção 1: 12 Cards de Indicadores Chave (3 linhas x 4 colunas)
  wsDest.mergeCells('B5:K5');
  wsDest.getRow(5).height = 24;
  const cKpiSec = wsDest.getCell('B5');
  cKpiSec.value = '1. PRINCIPAIS INDICADORES DE PERFORMANCE CONSOLIDADOS (KPIS)';
  cKpiSec.fill = fl(C.slate);
  cKpiSec.font = fn(true, 11, C.white);
  cKpiSec.alignment = al('left', 'middle');

  interface KpiCard {
    label: string;
    value: number;
    fmt: 'currency' | 'number' | 'percent';
    detail: string;
  }

  const kpisLine1: KpiCard[] = [
    { label: 'INVESTIMENTO TOTAL', value: totalSpent, fmt: 'currency', detail: `Orçado: R$ ${totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { label: 'ALCANCE TOTAL', value: totalReach, fmt: 'number', detail: 'Pessoas únicas atingidas' },
    { label: 'TOTAL DE IMPRESSÕES', value: totalImpr, fmt: 'number', detail: 'Exibições no Feed/Stories' },
    { label: 'FREQUÊNCIA MÉDIA', value: avgFrequency, fmt: 'percent', detail: 'Exibições por pessoa' }
  ];

  const kpisLine2: KpiCard[] = [
    { label: 'CONVERSAS NO WHATSAPP', value: totalConv, fmt: 'number', detail: 'Contatos diretos iniciados' },
    { label: 'CUSTO / CONVERSA WHATS', value: avgCostPerConv, fmt: 'currency', detail: 'Custo médio por lead direto' },
    { label: 'CLIQUES NO LINK', value: totalLinks, fmt: 'number', detail: 'Destinos e acessos externos' },
    { label: 'CUSTO / CLIQUE (CPC)', value: avgCPC, fmt: 'currency', detail: 'Média por clique no link' }
  ];

  const kpisLine3: KpiCard[] = [
    { label: 'VISUALIZAÇÕES THRUPLAY', value: totalViews, fmt: 'number', detail: 'Vídeos assistidos 15s+' },
    { label: 'CUSTO / THRUPLAY', value: avgCostPerView, fmt: 'currency', detail: 'Custo por vídeo retido' },
    { label: 'CUSTO POR 1.000 (CPM)', value: avgCPM, fmt: 'currency', detail: 'Custo para atingir 1.000' },
    { label: 'TAXA DE CLIQUES (CTR)', value: avgCTR, fmt: 'percent', detail: 'Taxa de conversão em clique' }
  ];

  const renderKpiRow = (cards: KpiCard[], startRow: number) => {
    // Row 1: Labels
    const rLabel = wsDest.getRow(startRow);
    rLabel.height = 18;
    // Row 2: Values
    const rVal = wsDest.getRow(startRow + 1);
    rVal.height = 26;
    // Row 3: Details
    const rDet = wsDest.getRow(startRow + 2);
    rDet.height = 16;

    const colPairs = [
      ['B', 'C'],
      ['D', 'E'],
      ['F', 'G'],
      ['H', 'K']
    ];

    cards.forEach((card, idx) => {
      const [cStart, cEnd] = colPairs[idx];
      wsDest.mergeCells(`${cStart}${startRow}:${cEnd}${startRow}`);
      wsDest.mergeCells(`${cStart}${startRow + 1}:${cEnd}${startRow + 1}`);
      wsDest.mergeCells(`${cStart}${startRow + 2}:${cEnd}${startRow + 2}`);

      const cellL = wsDest.getCell(`${cStart}${startRow}`);
      cellL.value = card.label;
      cellL.fill = fl(C.cardHeader);
      cellL.font = fn(true, 8.5, C.slate);
      cellL.alignment = al('center', 'middle');
      cellL.border = { top: bkThin, left: bkThin, right: bkThin };

      const cellV = wsDest.getCell(`${cStart}${startRow + 1}`);
      cellV.value = card.value;
      cellV.fill = fl(C.cardBg);
      cellV.font = fn(true, 13, C.black);
      cellV.alignment = al('center', 'middle');
      cellV.border = { left: bkThin, right: bkThin };
      if (card.fmt === 'currency') cellV.numFmt = BRL;
      else if (card.fmt === 'number') cellV.numFmt = NUM;
      else cellV.numFmt = PCT;

      const cellD = wsDest.getCell(`${cStart}${startRow + 2}`);
      cellD.value = card.detail;
      cellD.fill = fl(C.grayLight);
      cellD.font = fn(false, 8, 'FF6B7280');
      cellD.alignment = al('center', 'middle');
      cellD.border = { bottom: bkThin, left: bkThin, right: bkThin };
    });
  };

  renderKpiRow(kpisLine1, 7);
  renderKpiRow(kpisLine2, 11);
  renderKpiRow(kpisLine3, 15);

  // Seção 2: Tabela de Ações e Campanhas Veiculadas
  let destCurRow = 20;
  wsDest.mergeCells(`B${destCurRow}:K${destCurRow}`);
  wsDest.getRow(destCurRow).height = 24;
  const cCampSec = wsDest.getCell(`B${destCurRow}`);
  cCampSec.value = '2. DESTAQUE DAS AÇÕES E CAMPANHAS VEICULADAS NO MÊS';
  cCampSec.fill = fl(C.slate);
  cCampSec.font = fn(true, 11, C.white);
  cCampSec.alignment = al('left', 'middle');
  destCurRow++;

  const destHeaders = [
    'Nome da Ação / Anúncio',
    'Formato',
    'Objetivo Estratégico',
    'Validade',
    'Valor Gasto',
    'Alcance',
    'Resultado Chave',
    'Custo Unitário',
    'Filtro',
    'Cidade'
  ];

  const rDestHead = wsDest.getRow(destCurRow);
  rDestHead.height = 22;
  destHeaders.forEach((h, ci) => {
    const cell = rDestHead.getCell(ci + 2);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });
  destCurRow++;

  campaigns.forEach((c) => {
    let mainResult = '—';
    let mainCost = 0;
    if (c.conv > 0) {
      mainResult = `${c.conv} conversas`;
      mainCost = c.cConv;
    } else if (c.views > 0) {
      mainResult = `${c.views.toLocaleString('pt-BR')} views`;
      mainCost = c.cThru;
    } else if (c.links > 0) {
      mainResult = `${c.links.toLocaleString('pt-BR')} cliques`;
      mainCost = c.cpc;
    } else if (c.reach > 0) {
      mainResult = `${c.reach.toLocaleString('pt-BR')} pessoas`;
      mainCost = c.cpm;
    }

    const rowVals = [
      c.displayName || c.name,
      c.format,
      OBJ_LABELS[c.objective] || c.objective,
      c.validity || '—',
      c.spent,
      c.reach,
      mainResult,
      mainCost > 0 ? mainCost : '—',
      c.filtro || '—',
      c.cidade || '—'
    ];

    const row = wsDest.getRow(destCurRow);
    row.height = 20;
    rowVals.forEach((v, ci) => {
      const cell = row.getCell(ci + 2);
      cell.value = v;
      cell.fill = fl(C.white);
      cell.font = fn(false, 9.5, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;
      if (ci === 4) cell.numFmt = BRL;
      if (ci === 5) cell.numFmt = NUM;
      if (ci === 7 && typeof v === 'number') cell.numFmt = BRL;
    });
    destCurRow++;
  });

  // Linha de Totalização na Apresentação Destaque
  const rDestTot = wsDest.getRow(destCurRow);
  rDestTot.height = 24;
  const totDestVals = [
    `TOTAL CONSOLIDADO (${campaigns.length} AÇÕES)`,
    '',
    '',
    '',
    totalSpent,
    totalReach,
    totalConv > 0 ? `${totalConv} conversas` : `${totalReach} alcance`,
    avgCostPerConv > 0 ? avgCostPerConv : avgCPM,
    '',
    ''
  ];

  totDestVals.forEach((v, ci) => {
    const cell = rDestTot.getCell(ci + 2);
    cell.value = v;
    cell.fill = fl(C.totalBg);
    cell.font = fn(true, 10, C.black);
    cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
    cell.border = bAll;
    if (ci === 4) cell.numFmt = BRL;
    if (ci === 5) cell.numFmt = NUM;
    if (ci === 7 && typeof v === 'number') cell.numFmt = BRL;
  });
  destCurRow += 2;

  // Seção 3: Resumo Executivo e Leitura Estratégica
  wsDest.mergeCells(`B${destCurRow}:K${destCurRow}`);
  wsDest.getRow(destCurRow).height = 22;
  const cSumHead = wsDest.getCell(`B${destCurRow}`);
  cSumHead.value = '3. RESUMO EXECUTIVO ESTRATÉGICO';
  cSumHead.fill = fl(C.slate);
  cSumHead.font = fn(true, 10.5, C.white);
  cSumHead.alignment = al('left', 'middle');
  destCurRow++;

  const summaryBullets = [
    `• Orçamento e Investimento: Foram investidos um total de R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em ${campaigns.length} ações estratégicas no período.`,
    `• Amplitude e Audiência: O conjunto de campanhas alcançou ${totalReach.toLocaleString('pt-BR')} pessoas/contas únicas, gerando ${totalImpr.toLocaleString('pt-BR')} impressões totais com frequência equilibrada de ${avgFrequency.toFixed(2)}x.`,
    `• Geração de Conversas & Contatos: Foram iniciadas ${totalConv} conversas diretas de WhatsApp, garantindo atendimento ágil com custo médio de R$ ${avgCostPerConv.toFixed(2)} por conversa.`,
    `• Engajamento Audiovisual (Reels): Os conteúdos em formato de vídeo geraram ${totalViews.toLocaleString('pt-BR')} visualizações ThruPlay (retenção de 15s ou total) a um custo aproximado de R$ ${avgCostPerView.toFixed(3)} por visualização.`
  ];

  summaryBullets.forEach((bullet) => {
    wsDest.mergeCells(`B${destCurRow}:K${destCurRow}`);
    const row = wsDest.getRow(destCurRow);
    row.height = 20;
    const cell = row.getCell(2);
    cell.value = bullet;
    cell.fill = fl(C.white);
    cell.font = fn(false, 9.5, C.dark);
    cell.alignment = al('left', 'middle', true);
    cell.border = { left: bkThin, right: bkThin, bottom: bkThin };
    destCurRow++;
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PASTA 3: PILARES EXPLICADOS (GEMINI) - 17 COLUNAS COMPLETAS
  // ═════════════════════════════════════════════════════════════════════════
  const wsSeg = wb.addWorksheet('Pilares Explicados (Gemini)');

  wsSeg.columns = [
    { width: 30 }, // 1. NOME DA AÇÃO
    { width: 14 }, // 2. FORMATO
    { width: 16 }, // 3. VALIDADE
    { width: 15 }, // 4. INVESTIMENTO
    { width: 15 }, // 5. VALOR GASTO
    { width: 14 }, // 6. ALCANCE
    { width: 15 }, // 7. ENGAJAMENTO
    { width: 16 }, // 8. CLIQUES NO LINK
    { width: 22 }, // 9. VISUALIZAÇÃO (THRUPLAY)
    { width: 22 }, // 10. CUSTO POR 1.000 PESSOAS
    { width: 22 }, // 11. CUSTO POR CLIQUES NO LINK
    { width: 20 }, // 12. CUSTO POR THRUPLAY
    { width: 20 }, // 13. CUSTO POR INTERAÇÃO
    { width: 20 }, // 14. CUSTO POR CONVERSA
    { width: 16 }, // 15. FILTRO
    { width: 16 }, // 16. CIDADE
    { width: 22 }  // 17. CONVERSAS INICIADAS
  ];

  const HDR_17 = [
    'NOME DA AÇÃO',
    'FORMATO',
    'VALIDADE',
    'INVESTIMENTO',
    'VALOR GASTO',
    'ALCANCE',
    'ENGAJAMENTO',
    'CLIQUES NO LINK',
    'VISUALIZAÇÃO (THRUPLAY)',
    'CUSTO POR 1.000 PESSOAS',
    'CUSTO POR CLIQUES NO LINK',
    'CUSTO POR THRUPLAY',
    'CUSTO POR INTERAÇÃO',
    'CUSTO POR CONVERSA',
    'FILTRO',
    'CIDADE',
    'CONVERSAS INICIADAS'
  ];

  let segCurRow = 1;

  // Header Row 1: Título Geral
  const rSegTop = wsSeg.getRow(segCurRow);
  rSegTop.height = 34;
  wsSeg.mergeCells(`A${segCurRow}:Q${segCurRow}`);
  const cSegTop = wsSeg.getCell(`A${segCurRow}`);
  cSegTop.value = `RELATÓRIO SEGMENTADO POR PILARES ESTRATÉGICOS (GEMINI AI) • ${meta.cliente.toUpperCase()} (${meta.mes.toUpperCase()} ${meta.ano})`;
  cSegTop.fill = fl(C.orange);
  cSegTop.font = fn(true, 13, C.white);
  cSegTop.alignment = al('center', 'middle');
  cSegTop.border = { bottom: bkDark };
  segCurRow++;

  const renderSegHeaderRow = (rowIndex: number) => {
    const headRow = wsSeg.getRow(rowIndex);
    headRow.height = 24;
    HDR_17.forEach((h, ci) => {
      const cell = headRow.getCell(ci + 1);
      cell.value = h;
      cell.fill = fl(C.gray1);
      cell.font = fn(true, 9.5, C.black);
      cell.alignment = al('center', 'middle', true);
      cell.border = bAll;
    });
  };

  const renderSegCampaignRow = (r: CampaignRow, isReelsSection = false, isAlcanceSection = false) => {
    const o = r.objective;
    const isReels = isReelsSection || /^Reels/i.test(o);
    const isDuplicateReach = (isAlcanceSection || o === 'Alc') && r.reach > 0 && r.eng === r.reach;
    const engVal = isDuplicateReach ? '-' : (r.eng > 0 ? r.eng : '-');

    const vals = [
      r.displayName || r.name,
      r.format,
      r.validity || '-',
      r.budget > 0 ? r.budget : '-',
      r.spent > 0 ? r.spent : '-',
      r.reach > 0 ? r.reach : '-',
      engVal,
      r.links > 0 ? r.links : '-',
      isReels && r.views > 0 ? r.views : '-',
      (isAlcanceSection || o === 'Alc') && r.cpm > 0 ? r.cpm : '-',
      r.cpc > 0 ? r.cpc : '-',
      isReels && r.cThru > 0 ? r.cThru : '-',
      r.cInt > 0 ? r.cInt : '-',
      r.cConv > 0 ? r.cConv : '-',
      r.filtro || '-',
      r.cidade || '-',
      r.conv > 0 ? r.conv : '-'
    ];

    const row = wsSeg.addRow(vals);
    row.height = 20;

    vals.forEach((v, ci) => {
      const cell = row.getCell(ci + 1);
      cell.fill = fl(C.white);
      cell.font = fn(false, 9.5, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;

      if (typeof v === 'number') {
        if ([3, 4, 9, 10, 11, 12, 13].includes(ci)) cell.numFmt = BRL;
        if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
      }
    });

    segCurRow++;
  };

  // 1. Pilar Alcance
  const sec1 = wsSeg.getRow(segCurRow);
  sec1.height = 26;
  wsSeg.mergeCells(`A${segCurRow}:Q${segCurRow}`);
  const cSec1 = wsSeg.getCell(`A${segCurRow}`);
  cSec1.value = '1. CAMPANHAS DE ALCANCE (MARCA & DISTRIBUIÇÃO - PESSOAS ALCANÇADAS E CUSTO POR 1.000 CONTAS)';
  cSec1.fill = fl(C.blueHead);
  cSec1.font = fn(true, 11, C.white);
  cSec1.alignment = al('left', 'middle');
  cSec1.border = bAll;
  segCurRow++;

  renderSegHeaderRow(segCurRow);
  segCurRow++;

  let spentAlc = 0, budgetAlc = 0, reachAlc = 0;
  if (pillars.alcance.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha exclusiva de alcance no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) emptyRow.getCell(ci).border = bAll;
    segCurRow++;
  } else {
    pillars.alcance.forEach((c) => {
      spentAlc += c.spent;
      budgetAlc += c.budget;
      reachAlc += c.reach;
      renderSegCampaignRow(c, false, true);
    });

    const subAlcVals = [
      'SUBTOTAL ALCANCE',
      `${pillars.alcance.length} ações`,
      '-',
      budgetAlc > 0 ? budgetAlc : '-',
      spentAlc > 0 ? spentAlc : '-',
      reachAlc > 0 ? reachAlc : '-',
      '-', '-', '-',
      reachAlc > 0 && spentAlc > 0 ? (spentAlc / reachAlc) * 1000 : '-',
      '-', '-', '-', '-', '-', '-', '-'
    ];
    const subAlcRow = wsSeg.addRow(subAlcVals);
    subAlcRow.height = 22;
    subAlcVals.forEach((v, ci) => {
      const cell = subAlcRow.getCell(ci + 1);
      cell.fill = fl(C.blueSubBg);
      cell.font = fn(true, 10, C.blueHead);
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if (ci === 3 || ci === 4 || ci === 9) cell.numFmt = BRL;
      if (ci === 5) cell.numFmt = NUM;
    });
    segCurRow++;
  }

  // Linha espaçadora
  const rSep1 = wsSeg.addRow(Array(17).fill(''));
  rSep1.height = 12;
  for (let ci = 1; ci <= 17; ci++) rSep1.getCell(ci).fill = fl(C.separator);
  segCurRow++;

  // 2. Pilar Engajamento & Tráfego
  const sec2 = wsSeg.getRow(segCurRow);
  sec2.height = 26;
  wsSeg.mergeCells(`A${segCurRow}:Q${segCurRow}`);
  const cSec2 = wsSeg.getCell(`A${segCurRow}`);
  cSec2.value = '2. CAMPANHAS DE ENGAJAMENTO E TRÁFEGO (CONVERSAS NO WHATSAPP, ALCANCE, CUSTO POR CONVERSA E CLIQUES)';
  cSec2.fill = fl(C.greenHead);
  cSec2.font = fn(true, 11, C.white);
  cSec2.alignment = al('left', 'middle');
  cSec2.border = bAll;
  segCurRow++;

  renderSegHeaderRow(segCurRow);
  segCurRow++;

  let spentEng = 0, budgetEng = 0, reachEng = 0, convEng = 0, linksEng = 0, intEng = 0;
  if (pillars.engajamentoTrafego.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha nesta categoria no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) emptyRow.getCell(ci).border = bAll;
    segCurRow++;
  } else {
    pillars.engajamentoTrafego.forEach((c) => {
      spentEng += c.spent;
      budgetEng += c.budget;
      reachEng += c.reach;
      convEng += c.conv;
      linksEng += c.links;
      intEng += c.eng;
      renderSegCampaignRow(c, false, false);
    });

    const subEngVals = [
      'SUBTOTAL ENGAJAMENTO & TRÁFEGO',
      `${pillars.engajamentoTrafego.length} ações`,
      '-',
      budgetEng > 0 ? budgetEng : '-',
      spentEng > 0 ? spentEng : '-',
      reachEng > 0 ? reachEng : '-',
      intEng > 0 ? intEng : '-',
      linksEng > 0 ? linksEng : '-',
      '-',
      '-',
      linksEng > 0 && spentEng > 0 ? spentEng / linksEng : '-',
      '-',
      intEng > 0 && spentEng > 0 ? spentEng / intEng : '-',
      convEng > 0 && spentEng > 0 ? spentEng / convEng : '-',
      '-',
      '-',
      convEng > 0 ? convEng : '-'
    ];
    const subEngRow = wsSeg.addRow(subEngVals);
    subEngRow.height = 22;
    subEngVals.forEach((v, ci) => {
      const cell = subEngRow.getCell(ci + 1);
      cell.fill = fl(C.greenSubBg);
      cell.font = fn(true, 10, C.greenHead);
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if ([3, 4, 10, 12, 13].includes(ci)) cell.numFmt = BRL;
      if ([5, 6, 7, 16].includes(ci)) cell.numFmt = NUM;
    });
    segCurRow++;
  }

  // Linha espaçadora
  const rSep2 = wsSeg.addRow(Array(17).fill(''));
  rSep2.height = 12;
  for (let ci = 1; ci <= 17; ci++) rSep2.getCell(ci).fill = fl(C.separator);
  segCurRow++;

  // 3. Pilar Reels & Vídeos
  const sec3 = wsSeg.getRow(segCurRow);
  sec3.height = 26;
  wsSeg.mergeCells(`A${segCurRow}:Q${segCurRow}`);
  const cSec3 = wsSeg.getCell(`A${segCurRow}`);
  cSec3.value = '3. CAMPANHAS DE REELS E VÍDEOS (RETENÇÃO AUDIOVISUAL, ALCANCE, VISUALIZAÇÃO E CUSTO POR THRUPLAY)';
  cSec3.fill = fl(C.purpleHead);
  cSec3.font = fn(true, 11, C.white);
  cSec3.alignment = al('left', 'middle');
  cSec3.border = bAll;
  segCurRow++;

  renderSegHeaderRow(segCurRow);
  segCurRow++;

  let spentReels = 0, budgetReels = 0, reachReels = 0, viewsReels = 0, convReels = 0, linksReels = 0, intReels = 0;
  if (pillars.reels.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha de Reels no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) emptyRow.getCell(ci).border = bAll;
    segCurRow++;
  } else {
    pillars.reels.forEach((c) => {
      spentReels += c.spent;
      budgetReels += c.budget;
      reachReels += c.reach;
      viewsReels += c.views;
      convReels += c.conv;
      linksReels += c.links;
      intReels += c.eng;
      renderSegCampaignRow(c, true, false);
    });

    const subReelsVals = [
      'SUBTOTAL REELS & VÍDEO',
      `${pillars.reels.length} ações`,
      '-',
      budgetReels > 0 ? budgetReels : '-',
      spentReels > 0 ? spentReels : '-',
      reachReels > 0 ? reachReels : '-',
      intReels > 0 ? intReels : '-',
      linksReels > 0 ? linksReels : '-',
      viewsReels > 0 ? viewsReels : '-',
      '-',
      '-',
      viewsReels > 0 && spentReels > 0 ? spentReels / viewsReels : '-',
      '-',
      '-',
      '-',
      '-',
      convReels > 0 ? convReels : '-'
    ];
    const subReelsRow = wsSeg.addRow(subReelsVals);
    subReelsRow.height = 22;
    subReelsVals.forEach((v, ci) => {
      const cell = subReelsRow.getCell(ci + 1);
      cell.fill = fl(C.purpleSubBg);
      cell.font = fn(true, 10, C.purpleHead);
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if ([3, 4, 11].includes(ci)) cell.numFmt = BRL;
      if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
    });
    segCurRow++;
  }

  // Linha espaçadora
  const rSep3 = wsSeg.addRow(Array(17).fill(''));
  rSep3.height = 14;
  for (let ci = 1; ci <= 17; ci++) rSep3.getCell(ci).fill = fl(C.separator);
  segCurRow++;

  // Consolidação Geral dos 3 Pilares
  const grandTotalSpent = spentAlc + spentEng + spentReels;
  const grandTotalBudget = budgetAlc + budgetEng + budgetReels;
  const grandTotalReach = reachAlc + reachEng + reachReels;
  const grandTotalConv = convEng + convReels;
  const grandTotalViews = viewsReels;
  const grandTotalLinks = linksEng + linksReels;
  const grandTotalInt = intEng + intReels;

  const totalHead = wsSeg.getRow(segCurRow);
  totalHead.height = 26;
  wsSeg.mergeCells(`A${segCurRow}:Q${segCurRow}`);
  const cTotH = wsSeg.getCell(`A${segCurRow}`);
  cTotH.value = 'CONSOLIDAÇÃO GERAL DE TODOS OS PILARES (TOTAIS DO PERÍODO)';
  cTotH.fill = fl(C.orange);
  cTotH.font = fn(true, 11, C.white);
  cTotH.alignment = al('center', 'middle');
  cTotH.border = bAll;
  segCurRow++;

  const grandVals = [
    'TOTAL GERAL CONSOLIDADO',
    `${campaigns.length} campanhas`,
    '-',
    grandTotalBudget > 0 ? grandTotalBudget : '-',
    grandTotalSpent > 0 ? grandTotalSpent : '-',
    grandTotalReach > 0 ? grandTotalReach : '-',
    grandTotalInt > 0 ? grandTotalInt : '-',
    grandTotalLinks > 0 ? grandTotalLinks : '-',
    grandTotalViews > 0 ? grandTotalViews : '-',
    grandTotalReach > 0 && grandTotalSpent > 0 ? (grandTotalSpent / grandTotalReach) * 1000 : '-',
    grandTotalLinks > 0 && grandTotalSpent > 0 ? grandTotalSpent / grandTotalLinks : '-',
    grandTotalViews > 0 && grandTotalSpent > 0 ? grandTotalSpent / grandTotalViews : '-',
    '-',
    grandTotalConv > 0 && grandTotalSpent > 0 ? grandTotalSpent / grandTotalConv : '-',
    '-',
    '-',
    grandTotalConv > 0 ? grandTotalConv : '-'
  ];

  const totalRow = wsSeg.addRow(grandVals);
  totalRow.height = 24;
  grandVals.forEach((v, ci) => {
    const cell = totalRow.getCell(ci + 1);
    cell.fill = fl(C.totalBg);
    cell.font = fn(true, 10.5, C.black);
    cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
    cell.border = bAll;
    if ([3, 4, 9, 10, 11, 13].includes(ci)) cell.numFmt = BRL;
    if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
  });
  segCurRow += 2;

  // ═════════════════════════════════════════════════════════════════════════
  // PASTA 4: PLANILHA DE CUSTOS (MATRIZ) COM LEGENDA EXPLICATIVA COMPLETA
  // ═════════════════════════════════════════════════════════════════════════
  const wsMatriz = wb.addWorksheet('Planilha de Custos (Matriz)');
  wsMatriz.columns = wsSeg.columns;

  let matCurRow = 1;
  const rMatTop = wsMatriz.getRow(matCurRow);
  rMatTop.height = 34;
  wsMatriz.mergeCells(`A${matCurRow}:Q${matCurRow}`);
  const cMatTop = wsMatriz.getCell(`A${matCurRow}`);
  cMatTop.value = `PLANILHA DE CUSTOS E MATRIZ UNIFICADA DE IMPULSIONAMENTO (17 COLUNAS) • ${meta.cliente.toUpperCase()}`;
  cMatTop.fill = fl(C.orange);
  cMatTop.font = fn(true, 13, C.white);
  cMatTop.alignment = al('center', 'middle');
  cMatTop.border = { bottom: bkDark };
  matCurRow++;

  const rMatHead = wsMatriz.getRow(matCurRow);
  rMatHead.height = 24;
  HDR_17.forEach((h, ci) => {
    const cell = rMatHead.getCell(ci + 1);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });
  matCurRow++;

  let lastDateKeyXl = '';
  campaigns.forEach((r) => {
    const curDate = r.sortDate ? new Date(r.sortDate) : null;
    const curDateKey = curDate ? curDate.getTime() : 'none';

    if (lastDateKeyXl !== '' && curDateKey !== lastDateKeyXl) {
      const rBlank = wsMatriz.addRow(Array(17).fill(''));
      rBlank.height = 10;
      for (let ci = 1; ci <= 17; ci++) {
        rBlank.getCell(ci).fill = fl(C.separator);
        rBlank.getCell(ci).border = { top: bkThin, bottom: bkThin };
      }
      matCurRow++;
    }
    lastDateKeyXl = String(curDateKey);

    const o = r.objective;
    const isReelsXl = /^Reels/i.test(o);
    const isAlcanceRow = o === 'Alc';
    const isDuplicateReach = isAlcanceRow && r.reach > 0 && r.eng === r.reach;

    const vals = [
      r.displayName || r.name,
      r.format,
      r.validity || '-',
      r.budget > 0 ? r.budget : '-',
      r.spent > 0 ? r.spent : '-',
      r.reach > 0 ? r.reach : '-',
      isDuplicateReach ? '-' : (r.eng > 0 ? r.eng : '-'),
      r.links > 0 ? r.links : '-',
      isReelsXl && r.views > 0 ? r.views : '-',
      isAlcanceRow && r.cpm > 0 ? r.cpm : '-',
      r.cpc > 0 ? r.cpc : '-',
      isReelsXl && r.cThru > 0 ? r.cThru : '-',
      r.cInt > 0 ? r.cInt : '-',
      r.cConv > 0 ? r.cConv : '-',
      r.filtro || '-',
      r.cidade || '-',
      r.conv > 0 ? r.conv : '-'
    ];

    const row = wsMatriz.addRow(vals);
    row.height = 20;

    vals.forEach((v, ci) => {
      const cell = row.getCell(ci + 1);
      cell.fill = fl(C.white);
      cell.font = fn(false, 9.5, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;

      if (typeof v === 'number') {
        if ([3, 4, 9, 10, 11, 12, 13].includes(ci)) cell.numFmt = BRL;
        if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
      }
    });
    matCurRow++;
  });

  // Linha de Subtotal / Total Geral da Matriz
  const rMatTot = wsMatriz.addRow(grandVals);
  rMatTot.height = 24;
  grandVals.forEach((v, ci) => {
    const cell = rMatTot.getCell(ci + 1);
    cell.fill = fl(C.totalBg);
    cell.font = fn(true, 10.5, C.black);
    cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
    cell.border = bAll;
    if ([3, 4, 9, 10, 11, 13].includes(ci)) cell.numFmt = BRL;
    if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
  });
  matCurRow += 2;

  // LEGENDA DIDÁTICA COMPLETA DAS 17 COLUNAS NA MATRIZ
  const rMatLegHead = wsMatriz.getRow(matCurRow);
  rMatLegHead.height = 24;
  wsMatriz.mergeCells(`A${matCurRow}:Q${matCurRow}`);
  const cMatLegHead = wsMatriz.getCell(`A${matCurRow}`);
  cMatLegHead.value = 'GUIA DIDÁTICO E LEGENDA EXPLICATIVA DAS 17 COLUNAS (COMO UMA COISA SE LIGA À OUTRA)';
  cMatLegHead.fill = fl(C.dark);
  cMatLegHead.font = fn(true, 11, C.white);
  cMatLegHead.alignment = al('center', 'middle');
  matCurRow++;

  const columnGuideRows = [
    { num: 'Col 1', name: 'Nome da Ação', stage: 'Setup', desc: 'Identificação da peça publicitária, produto ou tema e data de veiculação.', import: 'Permite comparar quais produtos e ofertas geraram maior interesse no público.' },
    { num: 'Col 2', name: 'Formato', stage: 'Mídia', desc: 'Tipo de mídia exibida: Panfleto Virtual, Post, Carrossel ou Vídeo Reels.', import: 'Define o comportamento do algoritmo (Reels retém atenção; Panfleto gera impacto visual).' },
    { num: 'Col 3', name: 'Validade', stage: 'Tempo', desc: 'Janela de dias em que o anúncio esteve ativo na praça.', import: 'Garante senso de urgência e evita verba em ofertas já expiradas na loja física.' },
    { num: 'Col 4', name: 'Investimento', stage: 'Financeiro', desc: 'Orçamento inicialmente planejado e programado para a ação.', import: 'Referência financeira para controle do teto de gastos aprovado pelo cliente.' },
    { num: 'Col 5', name: 'Valor Gasto', stage: 'Financeiro', desc: 'Valor real faturado e consumido pelo leilão de anúncios da Meta.', import: 'É o valor oficial utilizado para todos os cálculos de custo unitário.' },
    { num: 'Col 6', name: 'Alcance', stage: 'Topo Funil', desc: 'Número de pessoas/contas únicas que visualizaram o anúncio no feed ou stories.', import: 'Mede o tamanho do público impactado na cidade. Em ações de alcance, não duplica.' },
    { num: 'Col 7', name: 'Engajamento', stage: 'Meio Funil', desc: 'Interações com o anúncio: curtidas, comentários, compartilhamentos e salvamentos.', import: 'Mostra o interesse genuíno das pessoas na oferta antes de tomarem a decisão de compra.' },
    { num: 'Col 8', name: 'Cliques Link', stage: 'Fundo Funil', desc: 'Cliques no botão do anúncio que levaram a destinos externos (site, encarte, WhatsApp).', import: 'Tráfego qualificado de pessoas que deram o próximo passo em direção à compra.' },
    { num: 'Col 9', name: 'Visualização ThruPlay', stage: 'Meio Funil', desc: 'Vídeos assistidos por pelo menos 15 segundos ou até o final.', import: 'Avalia a retenção audiovisual real em vídeos e Reels sem visualizações acidentais.' },
    { num: 'Col 10', name: 'Custo / 1.000 (CPM)', stage: 'Custo Topo', desc: 'Quanto custou para impactar 1.000 pessoas na cidade.', import: 'Métrica de eficiência de entrega: quanto menor o CPM, mais pessoas conhecem a marca.' },
    { num: 'Col 11', name: 'Custo / Clique (CPC)', stage: 'Custo Fundo', desc: 'Custo médio pago por cada visitante direcionado ao link da ação.', import: 'Indica se a oferta foi atraente o suficiente para tirar o usuário do feed.' },
    { num: 'Col 12', name: 'Custo / ThruPlay', stage: 'Custo Vídeo', desc: 'Custo médio por cada visualização de vídeo retida por 15 segundos ou mais.', import: 'Permite medir se o roteiro e edição do Reels conseguiram reter atenção a custo baixo.' },
    { num: 'Col 13', name: 'Custo / Interação', stage: 'Custo Meio', desc: 'Custo médio de cada curtida, compartilhamento ou comentário.', import: 'Avalia a viralidade e a aceitação comunitária das publicações.' },
    { num: 'Col 14', name: 'Custo / Conversa', stage: 'Custo Lead', desc: 'Custo médio por cada mensagem direta iniciada no WhatsApp da empresa.', import: 'Métrica de ouro para vendas: quanto custou colocar um cliente interessado no balcão digital.' },
    { num: 'Col 15', name: 'Filtro', stage: 'Geografia', desc: 'Segmentação aplicada no público (ex: Raio 5km, idade de 18 a 65 anos).', import: 'Garante que o anúncio seja entregue exatamente para quem pode comprar na loja.' },
    { num: 'Col 16', name: 'Cidade', stage: 'Geografia', desc: 'Município de veiculação e foco geográfico da entrega comercial.', import: 'Fundamental para redes de varejo com múltiplas filiais e foco municipal.' },
    { num: 'Col 17', name: 'Conversas Iniciadas', stage: 'Fundo Funil', desc: 'Volume absoluto de pessoas que clicaram e abriram um chat no WhatsApp.', import: 'Representa leads de alta intenção comercial gerados diretamente pelos anúncios.' }
  ];

  columnGuideRows.forEach((item) => {
    const row = wsMatriz.addRow([
      item.num,
      item.name,
      item.stage,
      item.desc,
      '', '', '', '',
      item.import,
      '', '', '', '', '', '', '', ''
    ]);
    row.height = 22;
    wsMatriz.mergeCells(`D${row.number}:H${row.number}`);
    wsMatriz.mergeCells(`I${row.number}:Q${row.number}`);

    for (let ci = 1; ci <= 17; ci++) {
      const cell = row.getCell(ci);
      cell.fill = fl(C.white);
      cell.font = fn(false, 9, C.dark);
      cell.border = bAll;
    }

    row.getCell(1).font = fn(true, 9, C.black);
    row.getCell(2).font = fn(true, 9.5, C.slate);
    row.getCell(3).font = fn(true, 8.5, C.orange);
    row.getCell(3).alignment = al('center', 'middle');
    matCurRow++;
  });

  // ═════════════════════════════════════════════════════════════════════════
  // PASTA 5: RESUMO EM GRÁFICOS (Distribuição de Orçamento & Retorno)
  // ═════════════════════════════════════════════════════════════════════════
  const wsGraf = wb.addWorksheet('Resumo em Gráficos');
  wsGraf.columns = [
    { width: 4 },   // A: Margem
    { width: 32 },  // B: Macro-Pilar / Objetivo
    { width: 14 },  // C: Nº Ações
    { width: 18 },  // D: Investimento
    { width: 18 },  // E: Gasto Real
    { width: 16 },  // F: Share (%)
    { width: 18 },  // G: Alcance Gerado
    { width: 22 },  // H: Resultado Principal
    { width: 18 }   // I: Custo Unitário
  ];

  let grafCurRow = 2;

  // Header da Aba
  wsGraf.mergeCells(`B${grafCurRow}:I${grafCurRow}`);
  wsGraf.getRow(grafCurRow).height = 36;
  const cGrafHead = wsGraf.getCell(`B${grafCurRow}`);
  cGrafHead.value = `RESUMO EM GRÁFICOS & DISTRIBUIÇÃO ORÇAMENTÁRIA`;
  cGrafHead.fill = fl(C.dark);
  cGrafHead.font = fn(true, 14, C.white);
  cGrafHead.alignment = al('center', 'middle');
  grafCurRow++;

  wsGraf.mergeCells(`B${grafCurRow}:I${grafCurRow}`);
  wsGraf.getRow(grafCurRow).height = 20;
  const cGrafSub = wsGraf.getCell(`B${grafCurRow}`);
  cGrafSub.value = `Distribuição estratégica de recursos e eficiência de resultados por objetivo • ${meta.cliente} (${meta.mes} ${meta.ano})`;
  cGrafSub.fill = fl(C.charcoal);
  cGrafSub.font = fn(false, 10, C.gold);
  cGrafSub.alignment = al('center', 'middle');
  grafCurRow += 2;

  // Tabela 1: Macro-Pilares
  wsGraf.mergeCells(`B${grafCurRow}:I${grafCurRow}`);
  wsGraf.getRow(grafCurRow).height = 24;
  const cPilarSec = wsGraf.getCell(`B${grafCurRow}`);
  cPilarSec.value = '1. DISTRIBUIÇÃO POR MACRO-PILARES DE MARKETING';
  cPilarSec.fill = fl(C.slate);
  cPilarSec.font = fn(true, 11, C.white);
  cPilarSec.alignment = al('left', 'middle');
  grafCurRow++;

  const pilarHeaders = [
    'Macro-Pilar Estratégico',
    'Nº Ações',
    'Investimento Orçado',
    'Valor Real Gasto',
    '% do Orçamento',
    'Alcance Gerado',
    'Resultado Principal',
    'Custo Médio Unitário'
  ];

  const rPilarHead = wsGraf.getRow(grafCurRow);
  rPilarHead.height = 22;
  pilarHeaders.forEach((h, ci) => {
    const cell = rPilarHead.getCell(ci + 2);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });
  grafCurRow++;

  const pilarDataRows = [
    {
      name: 'Pilar 1: Alcance (Reconhecimento)',
      count: pillars.alcance.length,
      budget: budgetAlc,
      spent: spentAlc,
      share: totalSpent > 0 ? spentAlc / totalSpent : 0,
      reach: reachAlc,
      result: `${reachAlc.toLocaleString('pt-BR')} contas`,
      cost: reachAlc > 0 ? (spentAlc / reachAlc) * 1000 : 0,
      costFmt: BRL
    },
    {
      name: 'Pilar 2: Engajamento & WhatsApp (Conversão)',
      count: pillars.engajamentoTrafego.length,
      budget: budgetEng,
      spent: spentEng,
      share: totalSpent > 0 ? spentEng / totalSpent : 0,
      reach: reachEng,
      result: `${convEng} conversas Whats`,
      cost: convEng > 0 ? spentEng / convEng : 0,
      costFmt: BRL
    },
    {
      name: 'Pilar 3: Reels & Vídeos (Retenção)',
      count: pillars.reels.length,
      budget: budgetReels,
      spent: spentReels,
      share: totalSpent > 0 ? spentReels / totalSpent : 0,
      reach: reachReels,
      result: `${viewsReels.toLocaleString('pt-BR')} ThruPlays`,
      cost: viewsReels > 0 ? spentReels / viewsReels : 0,
      costFmt: BRL
    }
  ];

  pilarDataRows.forEach((item) => {
    const row = wsGraf.getRow(grafCurRow);
    row.height = 22;
    const vals = [
      item.name,
      item.count,
      item.budget,
      item.spent,
      item.share,
      item.reach,
      item.result,
      item.cost
    ];

    vals.forEach((v, ci) => {
      const cell = row.getCell(ci + 2);
      cell.value = v;
      cell.fill = fl(C.white);
      cell.font = fn(false, 9.5, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;
      if (ci === 2 || ci === 3 || ci === 7) cell.numFmt = BRL;
      if (ci === 4) cell.numFmt = PCT;
      if (ci === 5) cell.numFmt = NUM;
    });
    grafCurRow++;
  });

  // Total dos macro-pilares
  const rPilarTot = wsGraf.getRow(grafCurRow);
  rPilarTot.height = 24;
  const pilarTotVals = [
    'TOTAL GERAL CONSOLIDADO',
    campaigns.length,
    totalBudget,
    totalSpent,
    1,
    totalReach,
    totalConv > 0 ? `${totalConv} conversas Whats` : `${totalReach} pessoas`,
    avgCostPerConv > 0 ? avgCostPerConv : avgCPM
  ];

  pilarTotVals.forEach((v, ci) => {
    const cell = rPilarTot.getCell(ci + 2);
    cell.value = v;
    cell.fill = fl(C.totalBg);
    cell.font = fn(true, 10, C.black);
    cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
    cell.border = bAll;
    if (ci === 2 || ci === 3 || ci === 7) cell.numFmt = BRL;
    if (ci === 4) cell.numFmt = PCT;
    if (ci === 5) cell.numFmt = NUM;
  });
  grafCurRow += 3;

  // Tabela 2: Distribuição Detalhada por Objetivo Específico
  wsGraf.mergeCells(`B${grafCurRow}:I${grafCurRow}`);
  wsGraf.getRow(grafCurRow).height = 24;
  const cObjSec = wsGraf.getCell(`B${grafCurRow}`);
  cObjSec.value = '2. DISTRIBUIÇÃO DETALHADA POR OBJETIVO ESPECÍFICO';
  cObjSec.fill = fl(C.slate);
  cObjSec.font = fn(true, 11, C.white);
  cObjSec.alignment = al('left', 'middle');
  grafCurRow++;

  const objHeaders = [
    'Objetivo Estratégico',
    'Nº Ações',
    'Investimento Orçado',
    'Valor Real Gasto',
    '% Share Orçamento',
    'Alcance Gerado',
    'Resultado Principal',
    'Custo Unitário Médio'
  ];

  const rObjHead = wsGraf.getRow(grafCurRow);
  rObjHead.height = 22;
  objHeaders.forEach((h, ci) => {
    const cell = rObjHead.getCell(ci + 2);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });
  grafCurRow++;

  // Agrupar por objetivo específico
  const objMap = new Map<string, { count: number; budget: number; spent: number; reach: number; conv: number; views: number; links: number; eng: number }>();
  campaigns.forEach((c) => {
    const key = c.objective;
    const cur = objMap.get(key) || { count: 0, budget: 0, spent: 0, reach: 0, conv: 0, views: 0, links: 0, eng: 0 };
    cur.count++;
    cur.budget += c.budget || 0;
    cur.spent += c.spent || 0;
    cur.reach += c.reach || 0;
    cur.conv += c.conv || 0;
    cur.views += c.views || 0;
    cur.links += c.links || 0;
    cur.eng += c.eng || 0;
    objMap.set(key, cur);
  });

  const sortedObjs = Array.from(objMap.entries()).sort((a, b) => b[1].spent - a[1].spent);

  sortedObjs.forEach(([objKey, val]) => {
    const label = OBJ_LABELS[objKey as keyof typeof OBJ_LABELS] || objKey;
    const share = totalSpent > 0 ? val.spent / totalSpent : 0;
    let resStr = '—';
    let unitCost = 0;

    if (val.conv > 0) {
      resStr = `${val.conv} conversas`;
      unitCost = val.spent / val.conv;
    } else if (val.views > 0) {
      resStr = `${val.views.toLocaleString('pt-BR')} views`;
      unitCost = val.spent / val.views;
    } else if (val.links > 0) {
      resStr = `${val.links.toLocaleString('pt-BR')} cliques`;
      unitCost = val.spent / val.links;
    } else if (val.reach > 0) {
      resStr = `${val.reach.toLocaleString('pt-BR')} alcance`;
      unitCost = (val.spent / val.reach) * 1000;
    }

    const row = wsGraf.getRow(grafCurRow);
    row.height = 20;
    const rowVals = [
      label,
      val.count,
      val.budget,
      val.spent,
      share,
      val.reach,
      resStr,
      unitCost
    ];

    rowVals.forEach((v, ci) => {
      const cell = row.getCell(ci + 2);
      cell.value = v;
      cell.fill = fl(C.white);
      cell.font = fn(false, 9.5, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;
      if (ci === 2 || ci === 3 || ci === 7) cell.numFmt = BRL;
      if (ci === 4) cell.numFmt = PCT;
      if (ci === 5) cell.numFmt = NUM;
    });
    grafCurRow++;
  });

  // Salvar buffer e disparar download do arquivo .xlsx
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileNameParts = [
    'Relatório de Impulsionamento',
    meta.cliente || 'Cliente',
    meta.mes || '',
    meta.ano || ''
  ]
    .filter(Boolean)
    .join(' - ');
  a.download = `${fileNameParts}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
