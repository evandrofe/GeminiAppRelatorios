import ExcelJS from 'exceljs';
import { CampaignRow, CapaData, ReportMeta } from '../types';
import { categorizeCampaignPillars } from './metaAdsParser';

export async function exportToExcel(
  meta: ReportMeta,
  campaigns: CampaignRow[],
  capa: CapaData
): Promise<void> {
  const C = {
    orange: 'FFFF9900',
    gold: 'FFFBBC04',
    gray1: 'FFB7B7B7',
    grayDark: 'FF333333',
    blueHead: 'FF1D4ED8',
    greenHead: 'FF047857',
    purpleHead: 'FF7C3AED',
    subtotalBg: 'FFF3F4F6',
    white: 'FFFFFFFF',
    black: 'FF000000',
    dark: 'FF222526',
    separator: 'FFF0F0F0'
  };

  const bk: ExcelJS.Border = { style: 'thin', color: { argb: C.black } };
  const bAll: Partial<ExcelJS.Borders> = { top: bk, bottom: bk, left: bk, right: bk };

  const fl = (argb: string): ExcelJS.Fill => ({
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb }
  });

  const fn = (
    bold = false,
    size = 10,
    argb = C.black,
    name = 'Arial'
  ): Partial<ExcelJS.Font> => ({
    bold: !!bold,
    size: size || 10,
    color: { argb: argb || C.black },
    name: name || 'Arial'
  });

  const al = (
    h: ExcelJS.Alignment['horizontal'] = 'center',
    v: ExcelJS.Alignment['vertical'] = 'top',
    wrapText = false
  ): Partial<ExcelJS.Alignment> => ({
    horizontal: h,
    vertical: v,
    wrapText: !!wrapText
  });

  const BRL = 'R$\\ #,##0.00';
  const NUM = '#,##0';

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Meta Ads & Gemini AI';
  wb.created = new Date();

  // ═════════════════════════════════════════════════════════
  // ABA 1: CAPA (Visual Dourado / Amarelo Institucional)
  // ═════════════════════════════════════════════════════════
  const wsCapa = wb.addWorksheet('Capa');
  const titulo = `${meta.cliente || 'CLIENTE'} - ${meta.mes || 'MÊS'} - ${meta.ano || 'ANO'}`;
  const G = fl(C.gold);

  wsCapa.columns = [
    { width: 2 },
    { width: 2 },
    { width: 22 },
    { width: 2 },
    { width: 16 },
    { width: 16 },
    { width: 2 },
    { width: 4 },
    { width: 2 },
    { width: 22 },
    { width: 2 },
    { width: 16 },
    { width: 16 },
    { width: 2 },
    { width: 2 },
    { width: 2 }
  ];

  for (let ri = 1; ri <= 16; ri++) {
    const rw = wsCapa.getRow(ri);
    for (let ci = 1; ci <= 16; ci++) {
      rw.getCell(ci).fill = G;
    }
  }

  // Row 1: Título Principal
  wsCapa.mergeCells('A1:P1');
  wsCapa.getRow(1).height = 52;
  const cTit = wsCapa.getCell('A1');
  cTit.value = titulo;
  cTit.fill = G;
  cTit.font = fn(true, 26, C.white, 'Arial');
  cTit.alignment = al('center', 'middle');

  wsCapa.getRow(2).height = 10;

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
  wsCapa.getRow(5).height = 32;
  wsCapa.getRow(6).height = 32;
  wsCapa.mergeCells('C5:G6');
  wsCapa.mergeCells('J5:N6');
  const cFBSeg = wsCapa.getCell('C5');
  cFBSeg.value = `Total de ${capa.fb.seguidores || '—'} seguidores`;
  cFBSeg.fill = G;
  cFBSeg.font = fn(false, 20, C.black, 'Arial');
  cFBSeg.alignment = al('center', 'middle', true);

  const cIGSeg = wsCapa.getCell('J5');
  cIGSeg.value = `Total de ${capa.ig.seguidores || '—'} seguidores`;
  cIGSeg.fill = G;
  cIGSeg.font = fn(false, 20, C.black, 'Arial');
  cIGSeg.alignment = al('center', 'middle', true);

  // Row 7: Seguidores mês anterior
  wsCapa.getRow(7).height = 22;
  wsCapa.mergeCells('C7:G7');
  wsCapa.mergeCells('J7:N7');
  const cFBSA = wsCapa.getCell('C7');
  cFBSA.value = `${capa.fb.segAnterior || '—'} seguidores no mês anterior`;
  cFBSA.fill = G;
  cFBSA.font = fn(true, 13, C.black, 'Arial');
  cFBSA.alignment = al('center', 'middle', true);

  const cIGSA = wsCapa.getCell('J7');
  cIGSA.value = `${capa.ig.segAnterior || '—'} seguidores no mês anterior`;
  cIGSA.fill = G;
  cIGSA.font = fn(true, 13, C.black, 'Arial');
  cIGSA.alignment = al('center', 'middle', true);

  wsCapa.getRow(8).height = 8;

  // Row 9-10: Gênero
  const pct = (v: string) => {
    const s = String(v || '').trim();
    return s ? (s.endsWith('%') ? s : `${s} %`) : '—';
  };

  wsCapa.getRow(9).height = 30;
  wsCapa.getRow(10).height = 30;
  wsCapa.mergeCells('C9:D10');
  wsCapa.mergeCells('E9:F10');
  wsCapa.mergeCells('J9:K10');
  wsCapa.mergeCells('L9:M10');

  const cFBH = wsCapa.getCell('C9');
  cFBH.value = `${pct(capa.fb.homens)} Homens`;
  cFBH.fill = G;
  cFBH.font = fn(true, 16, C.black, 'Arial');
  cFBH.alignment = al('center', 'middle');

  const cFBM = wsCapa.getCell('E9');
  cFBM.value = `${pct(capa.fb.mulheres)} Mulheres`;
  cFBM.fill = G;
  cFBM.font = fn(true, 16, C.black, 'Arial');
  cFBM.alignment = al('center', 'middle');

  const cIGH = wsCapa.getCell('J9');
  cIGH.value = `${pct(capa.ig.homens)} Homens`;
  cIGH.fill = G;
  cIGH.font = fn(true, 16, C.black, 'Arial');
  cIGH.alignment = al('center', 'middle');

  const cIGM = wsCapa.getCell('L9');
  cIGM.value = `${pct(capa.ig.mulheres)} Mulheres`;
  cIGM.fill = G;
  cIGM.font = fn(true, 16, C.black, 'Arial');
  cIGM.alignment = al('center', 'middle');

  wsCapa.getRow(11).height = 8;

  // Row 12-13: Valores métricas principais
  wsCapa.getRow(12).height = 34;
  wsCapa.getRow(13).height = 34;
  wsCapa.mergeCells('C12:D13');
  wsCapa.mergeCells('E12:E13');
  wsCapa.mergeCells('F12:F13');
  wsCapa.mergeCells('J12:K13');
  wsCapa.mergeCells('L12:L13');
  wsCapa.mergeCells('M12:M13');

  const cFBF = wsCapa.getCell('C12');
  cFBF.value = capa.fb.faixa || '—';
  cFBF.fill = G;
  cFBF.font = fn(true, 20, C.black, 'Arial');
  cFBF.alignment = al('center', 'middle');

  const cFBA = wsCapa.getCell('E12');
  cFBA.value = capa.fb.alcancadas || '—';
  cFBA.fill = G;
  cFBA.font = fn(true, 22, C.black, 'Arial');
  cFBA.alignment = al('center', 'middle');

  const cFBV = wsCapa.getCell('F12');
  cFBV.value = capa.fb.visitas || '—';
  cFBV.fill = G;
  cFBV.font = fn(true, 22, C.black, 'Arial');
  cFBV.alignment = al('center', 'middle');

  const cIGF = wsCapa.getCell('J12');
  cIGF.value = capa.ig.faixa || '—';
  cIGF.fill = G;
  cIGF.font = fn(true, 20, C.black, 'Arial');
  cIGF.alignment = al('center', 'middle');

  const cIGA = wsCapa.getCell('L12');
  cIGA.value = capa.ig.alcancadas || '—';
  cIGA.fill = G;
  cIGA.font = fn(true, 22, C.black, 'Arial');
  cIGA.alignment = al('center', 'middle');

  const cIGV = wsCapa.getCell('M12');
  cIGV.value = capa.ig.visitas || '—';
  cIGV.fill = G;
  cIGV.font = fn(true, 22, C.black, 'Arial');
  cIGV.alignment = al('center', 'middle');

  // Row 14: Rótulos das métricas
  wsCapa.getRow(14).height = 20;
  wsCapa.mergeCells('C14:D14');
  const lFBF = wsCapa.getCell('C14');
  lFBF.value = 'FAIXA ETÁRIA';
  lFBF.fill = G;
  lFBF.font = fn(false, 11, C.black, 'Arial');
  lFBF.alignment = al('center', 'middle');

  const lFBA = wsCapa.getCell('E14');
  lFBA.value = 'CONTAS ALCANÇADAS';
  lFBA.fill = G;
  lFBA.font = fn(false, 11, C.black, 'Arial');
  lFBA.alignment = al('center', 'middle', true);

  const lFBV = wsCapa.getCell('F14');
  lFBV.value = 'VISITAS À PÁGINA';
  lFBV.fill = G;
  lFBV.font = fn(false, 11, C.black, 'Arial');
  lFBV.alignment = al('center', 'middle', true);

  wsCapa.mergeCells('J14:K14');
  const lIGF = wsCapa.getCell('J14');
  lIGF.value = 'FAIXA ETÁRIA';
  lIGF.fill = G;
  lIGF.font = fn(false, 11, C.black, 'Arial');
  lIGF.alignment = al('center', 'middle');

  const lIGA = wsCapa.getCell('L14');
  lIGA.value = 'CONTAS ALCANÇADAS';
  lIGA.fill = G;
  lIGA.font = fn(false, 11, C.black, 'Arial');
  lIGA.alignment = al('center', 'middle', true);

  const lIGV = wsCapa.getCell('M14');
  lIGV.value = 'VISITAS AO PERFIL';
  lIGV.fill = G;
  lIGV.font = fn(false, 11, C.black, 'Arial');
  lIGV.alignment = al('center', 'middle', true);

  // ═════════════════════════════════════════════════════════════════════════
  // ABA 2: RELATÓRIO EXECUTIVO SEGMENTADO (Padrão Refinado Gemini)
  // ═════════════════════════════════════════════════════════════════════════
  const pillars = categorizeCampaignPillars(campaigns);
  const wsSeg = wb.addWorksheet('Relatório Segmentado (Gemini)');

  wsSeg.columns = [
    { width: 34 }, // Nome da Ação
    { width: 16 }, // Formato
    { width: 18 }, // Validade
    { width: 16 }, // Investimento
    { width: 16 }, // Valor Gasto
    { width: 16 }, // Pessoas Alcançadas
    { width: 18 }, // Conversas Whats / Visualizações
    { width: 18 }, // Custo por Conversa / Thruplay
    { width: 16 }, // Cliques
    { width: 16 }, // CPC / CPM
    { width: 18 }  // Engajamento
  ];

  let curRow = 1;

  // Título Geral da Planilha
  const titleRow = wsSeg.getRow(curRow);
  titleRow.height = 36;
  wsSeg.mergeCells(`A${curRow}:K${curRow}`);
  const cTitleSeg = wsSeg.getCell(`A${curRow}`);
  cTitleSeg.value = `RELATÓRIO DE DESEMPENHO META ADS • ${meta.cliente.toUpperCase()} (${meta.mes.toUpperCase()} ${meta.ano})`;
  cTitleSeg.fill = fl(C.orange);
  cTitleSeg.font = fn(true, 14, C.white, 'Arial');
  cTitleSeg.alignment = al('center', 'middle');
  cTitleSeg.border = bAll;
  curRow += 2;

  // ── SEÇÃO 1: CAMPANHAS DE ALCANCE ──
  const sec1Head = wsSeg.getRow(curRow);
  sec1Head.height = 28;
  wsSeg.mergeCells(`A${curRow}:K${curRow}`);
  const cSec1 = wsSeg.getCell(`A${curRow}`);
  cSec1.value = '1. CAMPANHAS DE ALCANCE (RECONHECIMENTO & DISTRIBUIÇÃO DE MARCA)';
  cSec1.fill = fl('FF1E3A8A'); // Blue dark
  cSec1.font = fn(true, 11, C.white);
  cSec1.alignment = al('left', 'middle');
  cSec1.border = bAll;
  curRow++;

  const alcHeaders = [
    'NOME DA AÇÃO / CRIATIVO',
    'FORMATO',
    'VALIDADE',
    'INVESTIMENTO',
    'VALOR GASTO',
    'PESSOAS ALCANÇADAS (ALCANCE)',
    'CUSTO POR 1.000 CONTAS (CPM)',
    '-',
    '-',
    '-',
    '-'
  ];
  const alcHeadRow = wsSeg.getRow(curRow);
  alcHeadRow.height = 22;
  alcHeaders.forEach((h, idx) => {
    const cell = alcHeadRow.getCell(idx + 1);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle');
    cell.border = bAll;
  });
  curRow++;

  let spentAlc = 0, budgetAlc = 0, reachAlc = 0;
  if (pillars.alcance.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha exclusiva de alcance no período.', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 11; ci++) {
      emptyRow.getCell(ci).border = bAll;
      emptyRow.getCell(ci).font = fn(false, 9, 'FF777777');
    }
    curRow++;
  } else {
    pillars.alcance.forEach((c) => {
      spentAlc += c.spent;
      budgetAlc += c.budget;
      reachAlc += c.reach;
      const vals = [
        c.displayName || c.name,
        c.format,
        c.validity || '-',
        c.budget > 0 ? c.budget : '-',
        c.spent > 0 ? c.spent : '-',
        c.reach > 0 ? c.reach : '-',
        c.cpm > 0 ? c.cpm : '-',
        '-', '-', '-', '-'
      ];
      const r = wsSeg.addRow(vals);
      r.height = 20;
      vals.forEach((v, ci) => {
        const cell = r.getCell(ci + 1);
        cell.fill = fl(C.white);
        cell.font = fn(false, 9.5, C.black);
        cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
        cell.border = bAll;
        if (typeof v === 'number') {
          if ([3, 4, 6].includes(ci)) cell.numFmt = BRL;
          if (ci === 5) cell.numFmt = NUM;
        }
      });
      curRow++;
    });

    // Linha Subtotal Alcance
    const subAlcRow = wsSeg.addRow([
      'SUBTOTAL ALCANCE',
      `${pillars.alcance.length} ações`,
      '-',
      budgetAlc > 0 ? budgetAlc : '-',
      spentAlc > 0 ? spentAlc : '-',
      reachAlc > 0 ? reachAlc : '-',
      reachAlc > 0 && spentAlc > 0 ? (spentAlc / reachAlc) * 1000 : '-',
      '-', '-', '-', '-'
    ]);
    subAlcRow.height = 22;
    for (let ci = 1; ci <= 11; ci++) {
      const cell = subAlcRow.getCell(ci);
      cell.fill = fl('FFE0E7FF');
      cell.font = fn(true, 10, 'FF1E3A8A');
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if (ci === 4 || ci === 5 || ci === 7) cell.numFmt = BRL;
      if (ci === 6) cell.numFmt = NUM;
    }
    curRow++;
  }
  curRow++;

  // ── SEÇÃO 2: CAMPANHAS DE ENGAJAMENTO & TRÁFEGO ──
  const sec2Head = wsSeg.getRow(curRow);
  sec2Head.height = 28;
  wsSeg.mergeCells(`A${curRow}:K${curRow}`);
  const cSec2 = wsSeg.getCell(`A${curRow}`);
  cSec2.value = '2. CAMPANHAS DE ENGAJAMENTO E TRÁFEGO (WHATSAPP, CONVERSAS E CLIQUES)';
  cSec2.fill = fl('FF065F46'); // Emerald dark
  cSec2.font = fn(true, 11, C.white);
  cSec2.alignment = al('left', 'middle');
  cSec2.border = bAll;
  curRow++;

  const engHeaders = [
    'NOME DA AÇÃO / CRIATIVO',
    'FORMATO',
    'VALIDADE',
    'INVESTIMENTO',
    'VALOR GASTO',
    'ALCANCE OBTIDO',
    'CONVERSAS WHATSAPP',
    'CUSTO / CONVERSA',
    'CLIQUES NO LINK',
    'CUSTO / CLIQUE (CPC)',
    'INTERAÇÕES / ENGAJ.'
  ];
  const engHeadRow = wsSeg.getRow(curRow);
  engHeadRow.height = 22;
  engHeaders.forEach((h, idx) => {
    const cell = engHeadRow.getCell(idx + 1);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle');
    cell.border = bAll;
  });
  curRow++;

  let spentEng = 0, budgetEng = 0, reachEng = 0, convEng = 0, linksEng = 0, intEng = 0;
  if (pillars.engajamentoTrafego.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha nesta categoria no período.', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 11; ci++) {
      emptyRow.getCell(ci).border = bAll;
      emptyRow.getCell(ci).font = fn(false, 9, 'FF777777');
    }
    curRow++;
  } else {
    pillars.engajamentoTrafego.forEach((c) => {
      spentEng += c.spent;
      budgetEng += c.budget;
      reachEng += c.reach;
      convEng += c.conv;
      linksEng += c.links;
      intEng += c.eng;

      const vals = [
        c.displayName || c.name,
        c.format,
        c.validity || '-',
        c.budget > 0 ? c.budget : '-',
        c.spent > 0 ? c.spent : '-',
        c.reach > 0 ? c.reach : '-',
        c.conv > 0 ? c.conv : '-',
        c.cConv > 0 ? c.cConv : '-',
        c.links > 0 ? c.links : '-',
        c.cpc > 0 ? c.cpc : '-',
        c.eng > 0 ? c.eng : '-'
      ];
      const r = wsSeg.addRow(vals);
      r.height = 20;
      vals.forEach((v, ci) => {
        const cell = r.getCell(ci + 1);
        cell.fill = fl(C.white);
        cell.font = fn(false, 9.5, C.black);
        cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
        cell.border = bAll;
        if (typeof v === 'number') {
          if ([3, 4, 7, 9].includes(ci)) cell.numFmt = BRL;
          if ([5, 6, 8, 10].includes(ci)) cell.numFmt = NUM;
        }
      });
      curRow++;
    });

    // Subtotal Engajamento & Tráfego
    const subEngRow = wsSeg.addRow([
      'SUBTOTAL ENGAJAMENTO & TRÁFEGO',
      `${pillars.engajamentoTrafego.length} ações`,
      '-',
      budgetEng > 0 ? budgetEng : '-',
      spentEng > 0 ? spentEng : '-',
      reachEng > 0 ? reachEng : '-',
      convEng > 0 ? convEng : '-',
      convEng > 0 && spentEng > 0 ? spentEng / convEng : '-',
      linksEng > 0 ? linksEng : '-',
      linksEng > 0 && spentEng > 0 ? spentEng / linksEng : '-',
      intEng > 0 ? intEng : '-'
    ]);
    subEngRow.height = 22;
    for (let ci = 1; ci <= 11; ci++) {
      const cell = subEngRow.getCell(ci);
      cell.fill = fl('FFD1FAE5');
      cell.font = fn(true, 10, 'FF065F46');
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if (ci === 4 || ci === 5 || ci === 8 || ci === 10) cell.numFmt = BRL;
      if (ci === 6 || ci === 7 || ci === 9 || ci === 11) cell.numFmt = NUM;
    }
    curRow++;
  }
  curRow++;

  // ── SEÇÃO 3: CAMPANHAS DE REELS & VÍDEO ──
  const sec3Head = wsSeg.getRow(curRow);
  sec3Head.height = 28;
  wsSeg.mergeCells(`A${curRow}:K${curRow}`);
  const cSec3 = wsSeg.getCell(`A${curRow}`);
  cSec3.value = '3. CAMPANHAS DE REELS E VÍDEOS (RETENÇÃO AUDIOVISUAL & THRUPLAY)';
  cSec3.fill = fl('FF5B21B6'); // Purple dark
  cSec3.font = fn(true, 11, C.white);
  cSec3.alignment = al('left', 'middle');
  cSec3.border = bAll;
  curRow++;

  const reelsHeaders = [
    'NOME DA AÇÃO / REEL',
    'FORMATO',
    'VALIDADE',
    'INVESTIMENTO',
    'VALOR GASTO',
    'ALCANCE DOS REELS',
    'VISUALIZAÇÕES (THRUPLAY)',
    'CUSTO / VISUALIZAÇÃO',
    'CONVERSAS GERADAS',
    'CLIQUES NO LINK',
    'INTERAÇÕES / RETENÇÃO'
  ];
  const reelsHeadRow = wsSeg.getRow(curRow);
  reelsHeadRow.height = 22;
  reelsHeaders.forEach((h, idx) => {
    const cell = reelsHeadRow.getCell(idx + 1);
    cell.value = h;
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black);
    cell.alignment = al('center', 'middle');
    cell.border = bAll;
  });
  curRow++;

  let spentReels = 0, budgetReels = 0, reachReels = 0, viewsReels = 0, convReels = 0, linksReels = 0, intReels = 0;
  if (pillars.reels.length === 0) {
    const emptyRow = wsSeg.addRow(['Nenhuma campanha de Reels no período.', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 11; ci++) {
      emptyRow.getCell(ci).border = bAll;
      emptyRow.getCell(ci).font = fn(false, 9, 'FF777777');
    }
    curRow++;
  } else {
    pillars.reels.forEach((c) => {
      spentReels += c.spent;
      budgetReels += c.budget;
      reachReels += c.reach;
      viewsReels += c.views;
      convReels += c.conv;
      linksReels += c.links;
      intReels += c.eng;

      const vals = [
        c.displayName || c.name,
        c.format,
        c.validity || '-',
        c.budget > 0 ? c.budget : '-',
        c.spent > 0 ? c.spent : '-',
        c.reach > 0 ? c.reach : '-',
        c.views > 0 ? c.views : '-',
        c.cThru > 0 ? c.cThru : '-',
        c.conv > 0 ? c.conv : '-',
        c.links > 0 ? c.links : '-',
        c.eng > 0 ? c.eng : '-'
      ];
      const r = wsSeg.addRow(vals);
      r.height = 20;
      vals.forEach((v, ci) => {
        const cell = r.getCell(ci + 1);
        cell.fill = fl(C.white);
        cell.font = fn(false, 9.5, C.black);
        cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
        cell.border = bAll;
        if (typeof v === 'number') {
          if ([3, 4, 7].includes(ci)) cell.numFmt = BRL;
          if ([5, 6, 8, 9, 10].includes(ci)) cell.numFmt = NUM;
        }
      });
      curRow++;
    });

    // Subtotal Reels
    const subReelsRow = wsSeg.addRow([
      'SUBTOTAL REELS & VÍDEO',
      `${pillars.reels.length} ações`,
      '-',
      budgetReels > 0 ? budgetReels : '-',
      spentReels > 0 ? spentReels : '-',
      reachReels > 0 ? reachReels : '-',
      viewsReels > 0 ? viewsReels : '-',
      viewsReels > 0 && spentReels > 0 ? spentReels / viewsReels : '-',
      convReels > 0 ? convReels : '-',
      linksReels > 0 ? linksReels : '-',
      intReels > 0 ? intReels : '-'
    ]);
    subReelsRow.height = 22;
    for (let ci = 1; ci <= 11; ci++) {
      const cell = subReelsRow.getCell(ci);
      cell.fill = fl('FFEDE9FE');
      cell.font = fn(true, 10, 'FF5B21B6');
      cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
      cell.border = bAll;
      if (ci === 4 || ci === 5 || ci === 8) cell.numFmt = BRL;
      if (ci === 6 || ci === 7 || ci === 9 || ci === 10 || ci === 11) cell.numFmt = NUM;
    }
    curRow++;
  }
  curRow++;

  // ── SEÇÃO 4: CONSOLIDAÇÃO GERAL DO MÊS ──
  const grandTotalSpent = spentAlc + spentEng + spentReels;
  const grandTotalReach = reachAlc + reachEng + reachReels;
  const grandTotalConv = convEng + convReels;
  const grandTotalViews = viewsReels;

  const totalHead = wsSeg.getRow(curRow);
  totalHead.height = 24;
  wsSeg.mergeCells(`A${curRow}:K${curRow}`);
  const cTotH = wsSeg.getCell(`A${curRow}`);
  cTotH.value = 'CONSOLIDAÇÃO TOTAL DO MÊS';
  cTotH.fill = fl(C.orange);
  cTotH.font = fn(true, 11, C.white);
  cTotH.alignment = al('center', 'middle');
  cTotH.border = bAll;
  curRow++;

  const totalRow = wsSeg.addRow([
    'TOTAL GERAL CONSOLIDADO',
    `${campaigns.length} campanhas`,
    '-',
    budgetAlc + budgetEng + budgetReels,
    grandTotalSpent,
    grandTotalReach,
    grandTotalConv > 0 ? `${grandTotalConv} conv.` : '-',
    grandTotalViews > 0 ? `${grandTotalViews} views` : '-',
    linksEng + linksReels,
    '-',
    intEng + intReels
  ]);
  totalRow.height = 24;
  for (let ci = 1; ci <= 11; ci++) {
    const cell = totalRow.getCell(ci);
    cell.fill = fl('FFFFEDD5');
    cell.font = fn(true, 11, C.black);
    cell.alignment = ci === 0 ? al('left', 'middle') : al('center', 'middle');
    cell.border = bAll;
    if (ci === 4 || ci === 5) cell.numFmt = BRL;
    if (ci === 6 || ci === 9 || ci === 11) cell.numFmt = NUM;
  }
  curRow += 2;

  // Raio-X dos Indicadores
  const rLT = wsSeg.addRow(['RAIO-X DOS RESULTADOS - ENTENDA O QUE CADA INDICADOR MOSTRA']);
  wsSeg.mergeCells(`A${rLT.number}:K${rLT.number}`);
  const cLT = rLT.getCell(1);
  cLT.fill = fl(C.orange);
  cLT.font = fn(true, 11, C.white, 'Century Gothic');
  cLT.alignment = al('center', 'middle');
  rLT.height = 22;

  const legs = [
    'Alcance: É o número de contas únicas que a postagem alcançou. Ou seja, a quantidade de pessoas/contas que receberam o post em seu feed ou stories.',
    'Engajamento: É o número de vezes que houve interação com a postagem de pessoas com maior probabilidade de interesse no produto ofertado (curtidas, comentários, compartilhamentos, salvamentos).',
    'Conversas iniciadas: Quantidade de conversas de mensagem iniciadas no WhatsApp a partir do anúncio direto.',
    'Visualização (ThruPlay): Número de vezes que o vídeo foi assistido por pelo menos 15 segundos ou até o fim, quando menor que esse tempo.',
    'Cliques no link: Quantidade de cliques em links do anúncio que levaram os usuários a destinos externos (site, cardápio online ou WhatsApp).'
  ];

  legs.forEach((txt) => {
    const rL = wsSeg.addRow([txt]);
    wsSeg.mergeCells(`A${rL.number}:K${rL.number}`);
    const cL = rL.getCell(1);
    cL.fill = fl(C.white);
    cL.font = fn(false, 9.5, C.dark);
    cL.alignment = al('left', 'top', true);
    cL.border = { bottom: bk, right: bk, left: bk };
    rL.height = 26;
  });

  // ═════════════════════════════════════════════════════════════════════════
  // ABA 3: RELATÓRIO GERAL CONSOLIDADO (Tabela Tradicional Completa)
  // ═════════════════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet('Relatório Geral');
  ws.columns = [
    { width: 28 }, // Nome
    { width: 14 }, // Formato
    { width: 16 }, // Validade
    { width: 15 }, // Investimento
    { width: 15 }, // Valor gasto
    { width: 14 }, // Alcance
    { width: 15 }, // Engajamento
    { width: 16 }, // Cliques no link
    { width: 20 }, // Visualização (thruplay)
    { width: 22 }, // CPM
    { width: 22 }, // CPC
    { width: 20 }, // Custo por thruplay
    { width: 20 }, // Custo por interação
    { width: 20 }, // Custo por conversa
    { width: 12 }, // Filtro
    { width: 12 }, // Cidade
    { width: 20 }  // Conversas iniciadas
  ];

  // Header Row 1: AÇÕES MENSAIS
  ws.addRow(['AÇÕES MENSAIS']);
  ws.mergeCells('A1:Q1');
  const r1 = ws.getCell('A1');
  r1.value = 'AÇÕES MENSAIS';
  r1.fill = fl(C.orange);
  r1.font = fn(true, 15, C.white);
  r1.alignment = al('center', 'middle');
  r1.border = { bottom: bk };
  ws.getRow(1).height = 32;

  // Header Row 2: Colunas
  const HDR = [
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

  ws.addRow(HDR);
  ws.getRow(2).height = 22;
  HDR.forEach((_, ci) => {
    const cell = ws.getRow(2).getCell(ci + 1);
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 10, C.black, 'Century Gothic');
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });

  let lastDateKeyXl = '';

  campaigns.forEach((r) => {
    const curDate = r.sortDate ? new Date(r.sortDate) : null;
    const curDateKey = curDate ? curDate.getTime() : 'none';

    if (lastDateKeyXl !== '' && curDateKey !== lastDateKeyXl) {
      const rBlank = ws.addRow(Array(17).fill(''));
      rBlank.height = 12;
      for (let ci = 1; ci <= 17; ci++) {
        rBlank.getCell(ci).fill = fl(C.separator);
        rBlank.getCell(ci).border = { top: bk, bottom: bk };
      }
    }
    lastDateKeyXl = String(curDateKey);

    const o = r.objective;
    const isReelsXl = /^Reels/i.test(o);

    const vals = [
      r.displayName || r.name,
      r.format,
      r.validity || '-',
      r.budget > 0 ? r.budget : '-',
      r.spent > 0 ? r.spent : '-',
      r.reach > 0 ? r.reach : '-',
      (o === 'Eng' || o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEng' || o === 'ReelsEngLink' || o === 'ReelsTrafLink' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats') && r.eng > 0 ? r.eng : '-',
      (o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink') && r.links > 0 ? r.links : '-',
      isReelsXl && r.views > 0 ? r.views : '-',
      o === 'Alc' && r.cpm > 0 ? r.cpm : '-',
      (o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink') && r.cpc > 0 ? r.cpc : '-',
      (o === 'ReelsAlc' || o === 'ReelsEng' || o === 'ReelsEngLink' || o === 'ReelsTrafLink') && r.cThru > 0 ? r.cThru : '-',
      (o === 'Eng' || o === 'ReelsEng') && r.cInt > 0 ? r.cInt : '-',
      (o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats') && r.cConv > 0 ? r.cConv : '-',
      '-',
      '-',
      (o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats') && r.conv > 0 ? r.conv : '-'
    ];

    const row = ws.addRow(vals);
    row.height = 20;

    vals.forEach((v, ci) => {
      const cell = row.getCell(ci + 1);
      cell.fill = fl(C.white);
      cell.font = fn(false, 10, C.black);
      cell.alignment = ci === 0 ? al('left', 'middle', true) : al('center', 'middle');
      cell.border = bAll;

      if (typeof v === 'number') {
        if ([3, 4, 9, 10, 11, 12, 13].includes(ci)) cell.numFmt = BRL;
        if ([5, 6, 7, 8, 16].includes(ci)) cell.numFmt = NUM;
      }
    });
  });

  // Salvar buffer e disparar download
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
