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
    blueHead: 'FF1E3A8A',
    greenHead: 'FF065F46',
    purpleHead: 'FF5B21B6',
    blueSubBg: 'FFE0E7FF',
    greenSubBg: 'FFD1FAE5',
    purpleSubBg: 'FFEDE9FE',
    totalBg: 'FFFFEDD5',
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
  // ABA 2: RELATÓRIO (AÇÕES MENSAIS COM TODAS AS 17 COLUNAS ORIGINAIS)
  // ESTRUTURADO E REMANEJADO POR PILARES COM SUBTOTAL E CABEÇALHOS COMPLETOS
  // ═════════════════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet('Relatório');

  // Larguras completas das 17 colunas originais
  ws.columns = [
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
    { width: 12 }, // 15. FILTRO
    { width: 12 }, // 16. CIDADE
    { width: 22 }  // 17. CONVERSAS INICIADAS
  ];

  const HDR_ORIGINAL = [
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

  let curRow = 1;

  // Header Row 1: Título Geral AÇÕES MENSAIS
  const rTop = ws.getRow(curRow);
  rTop.height = 34;
  ws.mergeCells(`A${curRow}:Q${curRow}`);
  const cTop = ws.getCell(`A${curRow}`);
  cTop.value = `AÇÕES MENSAIS • ${meta.cliente.toUpperCase()} (${meta.mes.toUpperCase()} ${meta.ano})`;
  cTop.fill = fl(C.orange);
  cTop.font = fn(true, 14, C.white);
  cTop.alignment = al('center', 'middle');
  cTop.border = { bottom: bk };
  curRow++;

  const renderHeaderRow = (rowIndex: number) => {
    const headRow = ws.getRow(rowIndex);
    headRow.height = 24;
    HDR_ORIGINAL.forEach((h, ci) => {
      const cell = headRow.getCell(ci + 1);
      cell.value = h;
      cell.fill = fl(C.gray1);
      cell.font = fn(true, 9.5, C.black, 'Century Gothic');
      cell.alignment = al('center', 'middle', true);
      cell.border = bAll;
    });
  };

  const renderCampaignRow = (r: CampaignRow, isReelsSection = false, isAlcanceSection = false) => {
    const o = r.objective;
    const isReels = isReelsSection || /^Reels/i.test(o);

    // Engajamento não deve duplicar o alcance se for campanha de alcance
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

    const row = ws.addRow(vals);
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

    curRow++;
  };

  const pillars = categorizeCampaignPillars(campaigns);

  // ─────────────────────────────────────────────────────────
  // SEÇÃO 1: CAMPANHAS DE ALCANCE (MARCA & DISTRIBUIÇÃO)
  // ─────────────────────────────────────────────────────────
  const sec1 = ws.getRow(curRow);
  sec1.height = 26;
  ws.mergeCells(`A${curRow}:Q${curRow}`);
  const cSec1 = ws.getCell(`A${curRow}`);
  cSec1.value = '1. CAMPANHAS DE ALCANCE (MARCA & DISTRIBUIÇÃO - PESSOAS ALCANÇADAS E CUSTO POR 1.000 CONTAS)';
  cSec1.fill = fl(C.blueHead);
  cSec1.font = fn(true, 11, C.white);
  cSec1.alignment = al('left', 'middle');
  cSec1.border = bAll;
  curRow++;

  renderHeaderRow(curRow);
  curRow++;

  let spentAlc = 0, budgetAlc = 0, reachAlc = 0;
  if (pillars.alcance.length === 0) {
    const emptyRow = ws.addRow(['Nenhuma campanha exclusiva de alcance no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) {
      emptyRow.getCell(ci).border = bAll;
      emptyRow.getCell(ci).font = fn(false, 9, 'FF777777');
    }
    curRow++;
  } else {
    pillars.alcance.forEach((c) => {
      spentAlc += c.spent;
      budgetAlc += c.budget;
      reachAlc += c.reach;
      renderCampaignRow(c, false, true);
    });

    // Subtotal Alcance em todas as 17 colunas
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
    const subAlcRow = ws.addRow(subAlcVals);
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
    curRow++;
  }

  // Linha espaçadora
  const rSep1 = ws.addRow(Array(17).fill(''));
  rSep1.height = 12;
  for (let ci = 1; ci <= 17; ci++) rSep1.getCell(ci).fill = fl(C.separator);
  curRow++;

  // ─────────────────────────────────────────────────────────
  // SEÇÃO 2: CAMPANHAS DE ENGAJAMENTO & TRÁFEGO
  // ─────────────────────────────────────────────────────────
  const sec2 = ws.getRow(curRow);
  sec2.height = 26;
  ws.mergeCells(`A${curRow}:Q${curRow}`);
  const cSec2 = ws.getCell(`A${curRow}`);
  cSec2.value = '2. CAMPANHAS DE ENGAJAMENTO E TRÁFEGO (CONVERSAS NO WHATSAPP, ALCANCE, CUSTO POR CONVERSA E CLIQUES)';
  cSec2.fill = fl(C.greenHead);
  cSec2.font = fn(true, 11, C.white);
  cSec2.alignment = al('left', 'middle');
  cSec2.border = bAll;
  curRow++;

  renderHeaderRow(curRow);
  curRow++;

  let spentEng = 0, budgetEng = 0, reachEng = 0, convEng = 0, linksEng = 0, intEng = 0;
  if (pillars.engajamentoTrafego.length === 0) {
    const emptyRow = ws.addRow(['Nenhuma campanha nesta categoria no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) {
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
      renderCampaignRow(c, false, false);
    });

    // Subtotal Engajamento & Tráfego em todas as 17 colunas
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
    const subEngRow = ws.addRow(subEngVals);
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
    curRow++;
  }

  // Linha espaçadora
  const rSep2 = ws.addRow(Array(17).fill(''));
  rSep2.height = 12;
  for (let ci = 1; ci <= 17; ci++) rSep2.getCell(ci).fill = fl(C.separator);
  curRow++;

  // ─────────────────────────────────────────────────────────
  // SEÇÃO 3: CAMPANHAS DE REELS E VÍDEOS
  // ─────────────────────────────────────────────────────────
  const sec3 = ws.getRow(curRow);
  sec3.height = 26;
  ws.mergeCells(`A${curRow}:Q${curRow}`);
  const cSec3 = ws.getCell(`A${curRow}`);
  cSec3.value = '3. CAMPANHAS DE REELS E VÍDEOS (RETENÇÃO AUDIOVISUAL, ALCANCE, VISUALIZAÇÃO E CUSTO POR THRUPLAY)';
  cSec3.fill = fl(C.purpleHead);
  cSec3.font = fn(true, 11, C.white);
  cSec3.alignment = al('left', 'middle');
  cSec3.border = bAll;
  curRow++;

  renderHeaderRow(curRow);
  curRow++;

  let spentReels = 0, budgetReels = 0, reachReels = 0, viewsReels = 0, convReels = 0, linksReels = 0, intReels = 0;
  if (pillars.reels.length === 0) {
    const emptyRow = ws.addRow(['Nenhuma campanha de Reels no período.', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    emptyRow.height = 20;
    for (let ci = 1; ci <= 17; ci++) {
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
      renderCampaignRow(c, true, false);
    });

    // Subtotal Reels em todas as 17 colunas
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
    const subReelsRow = ws.addRow(subReelsVals);
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
    curRow++;
  }

  // Linha espaçadora
  const rSep3 = ws.addRow(Array(17).fill(''));
  rSep3.height = 14;
  for (let ci = 1; ci <= 17; ci++) rSep3.getCell(ci).fill = fl(C.separator);
  curRow++;

  // ─────────────────────────────────────────────────────────
  // CONSOLIDAÇÃO TOTAL DO MÊS (17 COLUNAS COMPLETAS)
  // ─────────────────────────────────────────────────────────
  const grandTotalSpent = spentAlc + spentEng + spentReels;
  const grandTotalBudget = budgetAlc + budgetEng + budgetReels;
  const grandTotalReach = reachAlc + reachEng + reachReels;
  const grandTotalConv = convEng + convReels;
  const grandTotalViews = viewsReels;
  const grandTotalLinks = linksEng + linksReels;
  const grandTotalInt = intEng + intReels;

  const totalHead = ws.getRow(curRow);
  totalHead.height = 26;
  ws.mergeCells(`A${curRow}:Q${curRow}`);
  const cTotH = ws.getCell(`A${curRow}`);
  cTotH.value = 'CONSOLIDAÇÃO GERAL DE TODOS OS PILARES (TOTAIS DO PERÍODO)';
  cTotH.fill = fl(C.orange);
  cTotH.font = fn(true, 11, C.white);
  cTotH.alignment = al('center', 'middle');
  cTotH.border = bAll;
  curRow++;

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

  const totalRow = ws.addRow(grandVals);
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
  curRow += 2;

  // Raio-X dos Resultados
  const rLT = ws.addRow(['RAIO-X DOS RESULTADOS - ENTENDA O QUE CADA INDICADOR MOSTRA']);
  ws.mergeCells(`A${rLT.number}:I${rLT.number}`);
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
    const rL = ws.addRow([txt]);
    ws.mergeCells(`A${rL.number}:I${rL.number}`);
    const cL = rL.getCell(1);
    cL.fill = fl(C.white);
    cL.font = fn(false, 9.5, C.dark);
    cL.alignment = al('left', 'top', true);
    cL.border = { bottom: bk, right: bk, left: bk };
    rL.height = 26;
  });

  const rSepFoot = ws.addRow(Array(9).fill(''));
  rSepFoot.height = 10;
  for (let ci = 1; ci <= 9; ci++) {
    rSepFoot.getCell(ci).border = { bottom: { style: 'double', color: { argb: C.black } } };
    rSepFoot.getCell(ci).fill = fl(C.white);
  }

  const fnTxt =
    '*Algumas colunas podem não ser preenchidas, pois variam de acordo com o tipo de impulsionamento e com as métricas disponíveis em cada campanha. Além disso, em alguns casos, a plataforma pode não utilizar toda a verba prevista, seja por limitação de público, concorrência no leilão de anúncios, baixo engajamento ou instabilidades na entrega. Por isso, o valor efetivamente considerado como consumido é o da coluna "Valor gasto".';

  const rFn = ws.addRow([fnTxt]);
  ws.mergeCells(`A${rFn.number}:I${rFn.number}`);
  const cFn = rFn.getCell(1);
  cFn.fill = fl(C.white);
  cFn.font = fn(false, 9.5, C.black, 'Century Gothic');
  cFn.alignment = al('left', 'top', true);
  cFn.border = {
    bottom: { style: 'double', color: { argb: C.black } },
    right: { style: 'double', color: { argb: C.black } },
    left: { style: 'double', color: { argb: C.black } }
  };
  rFn.height = 54;

  // ═════════════════════════════════════════════════════════════════════════
  // ABA 3: CRONOLÓGICO (Planilha contínua ordenada por data)
  // ═════════════════════════════════════════════════════════════════════════
  const wsCron = wb.addWorksheet('Visão Cronológica');
  wsCron.columns = ws.columns;

  wsCron.addRow(['AÇÕES MENSAIS (ORDEM CRONOLÓGICA)']);
  wsCron.mergeCells('A1:Q1');
  const r1Cron = wsCron.getCell('A1');
  r1Cron.value = 'AÇÕES MENSAIS (ORDEM CRONOLÓGICA)';
  r1Cron.fill = fl(C.orange);
  r1Cron.font = fn(true, 14, C.white);
  r1Cron.alignment = al('center', 'middle');
  r1Cron.border = { bottom: bk };
  wsCron.getRow(1).height = 30;

  const rHeadCron = wsCron.addRow(HDR_ORIGINAL);
  rHeadCron.height = 22;
  HDR_ORIGINAL.forEach((_, ci) => {
    const cell = rHeadCron.getCell(ci + 1);
    cell.fill = fl(C.gray1);
    cell.font = fn(true, 9.5, C.black, 'Century Gothic');
    cell.alignment = al('center', 'middle', true);
    cell.border = bAll;
  });

  let lastDateKeyXl = '';
  campaigns.forEach((r) => {
    const curDate = r.sortDate ? new Date(r.sortDate) : null;
    const curDateKey = curDate ? curDate.getTime() : 'none';

    if (lastDateKeyXl !== '' && curDateKey !== lastDateKeyXl) {
      const rBlank = wsCron.addRow(Array(17).fill(''));
      rBlank.height = 12;
      for (let ci = 1; ci <= 17; ci++) {
        rBlank.getCell(ci).fill = fl(C.separator);
        rBlank.getCell(ci).border = { top: bk, bottom: bk };
      }
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

    const row = wsCron.addRow(vals);
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
