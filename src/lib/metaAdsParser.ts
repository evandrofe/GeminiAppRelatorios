import * as XLSX from 'xlsx';
import { CampaignRow, CapaData, ClassifierConfig, ObjectiveType, ReportMeta } from '../types';

export const OBJ_LABELS: Record<ObjectiveType, string> = {
  Alc: 'Alcance',
  Eng: 'Engajamento',
  EngLink: 'Engajamento de Link',
  EngWhats: 'Engajamento Conversa de Whats',
  TrafLink: 'Tráfego de Link',
  TrafWhats: 'Tráfego Conversas Whats',
  ReelsAlc: 'Reels Alcance',
  ReelsEng: 'Reels Engajamento',
  ReelsEngLink: 'Reels Engajamento de Link',
  ReelsEngWhats: 'Reels Engajamento Conversa Whats',
  ReelsTrafLink: 'Reels Tráfego de Link',
  ReelsTrafWhats: 'Reels Tráfego Conversas Whats',
  indefinido: '⚠ Não detectado'
};

export const OBJ_COLORS: Record<ObjectiveType, { bg: string; text: string; border: string }> = {
  Alc: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  Eng: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  EngLink: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  EngWhats: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  TrafLink: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  TrafWhats: { bg: 'bg-teal-500/10', text: 'text-teal-300', border: 'border-teal-500/30' },
  ReelsAlc: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  ReelsEng: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  ReelsEngLink: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  ReelsEngWhats: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  ReelsTrafLink: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/30' },
  ReelsTrafWhats: { bg: 'bg-emerald-600/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  indefinido: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
};

export const OBJ_OPTIONS: ObjectiveType[] = [
  'Alc',
  'Eng',
  'EngLink',
  'EngWhats',
  'TrafLink',
  'TrafWhats',
  'ReelsAlc',
  'ReelsEng',
  'ReelsEngLink',
  'ReelsEngWhats',
  'ReelsTrafLink',
  'ReelsTrafWhats'
];

export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  normalizationAliases: {
    panfleto: ['panfletos'],
    tabloide: ['tabloides', 'tablóide', 'tablóides', 'tabloid', 'tabloids'],
    virtual: ['virtuais'],
    carrossel: ['carrosel', 'carrosseis', 'carrosséis'],
    reels: ['reel', 'reels'],
    video: ['vídeo', 'videos', 'vídeos', 'vid'],
    whatsapp: ['whats', 'wpp', 'zap', 'zapp', 'wats'],
    engajamento: ['eng', 'engaj', 'engajamentos'],
    alcance: ['alc', 'al', 'alcances'],
    conversa: ['conversas'],
    clique: ['cliques', 'clic'],
    link: ['links']
  },
  formatKeywords: [
    { keyword: 'reels', label: 'Reels' },
    { keyword: 'panfleto', label: 'Panfleto', aliases: ['virtual', 'tabloide'] },
    { keyword: 'carrossel', label: 'Carrossel' },
    { keyword: 'post', label: 'Post' },
    { keyword: 'video', label: 'Vídeo', aliases: ['vídeo'] }
  ],
  objectivePriority: {
    Alc: 1,
    Eng: 2,
    EngLink: 3,
    EngWhats: 4,
    TrafLink: 5,
    TrafWhats: 6,
    ReelsAlc: 7,
    ReelsEng: 8,
    ReelsEngLink: 9,
    ReelsEngWhats: 10,
    ReelsTrafLink: 11,
    ReelsTrafWhats: 12,
    indefinido: 999
  },
  objectiveRules: [
    // Reels específicas com WhatsApp
    { name: 'Reels Eng Whats', objective: 'ReelsEngWhats', when: { allWords: [['reels', 'reel'], ['whats', 'whatsapp', 'wpp', 'zap', 'wats']] } },
    { name: 'Reels Tráfego Whats', objective: 'ReelsTrafWhats', when: { allWords: [['reels', 'reel'], ['traf', 'trafego'], ['whats', 'whatsapp', 'wpp', 'zap', 'wats']] } },
    { name: 'Reels Tráfego Link', objective: 'ReelsTrafLink', when: { allWords: [['reels', 'reel'], ['traf', 'trafego'], ['link', 'clique']] } },
    { name: 'Reels Eng Link', objective: 'ReelsEngLink', when: { allWords: [['reels', 'reel'], ['eng', 'engajamento', 'engaj'], ['link', 'clique']] } },
    { name: 'Reels Eng', objective: 'ReelsEng', when: { allWords: [['reels', 'reel'], ['eng', 'engajamento', 'engaj']] } },
    { name: 'Reels Alcance', objective: 'ReelsAlc', when: { anyWords: [['reels', 'reel']] } },

    // Mídia comum: Qualquer ação com Whats / WhatsApp tem objetivo principal Eng Whats (Engajamento Conversa de Whats)
    { name: 'Eng Whats', objective: 'EngWhats', when: { anyWords: [['whats', 'whatsapp', 'wpp', 'zap', 'wats']] } },
    { name: 'Tráfego Link', objective: 'TrafLink', when: { allWords: [['traf', 'trafego'], ['link', 'clique']] } },
    { name: 'Eng Link', objective: 'EngLink', when: { allWords: [['eng', 'engajamento', 'engaj'], ['link', 'clique']] } },
    { name: 'Engajamento', objective: 'Eng', when: { anyWords: [['eng', 'engajamento', 'engaj']] } },
    { name: 'Alcance', objective: 'Alc', when: { anyWords: [['alc', 'alcance']] } }
  ]
};

// Levenshtein
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = [];
    for (let j = 0; j <= n; j++) d[i][j] = 0;
  }
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return d[m][n];
}

function fuzzyMatch(word: string, targets: string[], maxDist: number = 1): boolean {
  const normalized = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized === t) return true;
    if (normalized.length >= 3 && t.length >= 3 && levenshtein(normalized, t) <= maxDist) return true;
  }
  return false;
}

export class CampaignClassifierEngine {
  private config: ClassifierConfig;

  constructor(customConfig?: ClassifierConfig) {
    this.config = customConfig || JSON.parse(JSON.stringify(DEFAULT_CLASSIFIER_CONFIG));
  }

  normalizeText(value: string): string {
    return String(value || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  normalizeWord(value: string): string {
    return this.normalizeText(value).toLowerCase();
  }

  toSingular(value: string): string {
    const word = this.normalizeWord(value);
    if (!word) return '';
    if (word.endsWith('oes') || word.endsWith('aes')) return word.slice(0, -3) + 'ao';
    if (word.endsWith('is') && word.length > 4) return word.slice(0, -2) + 'l';
    if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
    return word;
  }

  tokenize(value: string): string[] {
    const rawTokens = this.normalizeText(value).split(/[\s\-–_]+/).filter(Boolean);
    const result: string[] = [];
    rawTokens.forEach((token) => {
      const canonical = token.toLowerCase();
      result.push(canonical);
      const singular = this.toSingular(canonical);
      if (singular && singular !== canonical) result.push(singular);
    });
    return Array.from(new Set(result));
  }

  detectFormat(campName: string, adName?: string): string {
    const sources = [campName, adName].filter(Boolean) as string[];
    for (const source of sources) {
      const tokens = this.tokenize(source);
      for (const kw of this.config.formatKeywords) {
        const variants = [kw.keyword, ...(kw.aliases || [])];
        for (const token of tokens) {
          if (fuzzyMatch(token, variants, 1)) {
            return kw.label || kw.keyword;
          }
        }
      }
    }
    return '-';
  }

  detectObjective(campName: string, format: string): ObjectiveType {
    const words = this.tokenize(campName);
    for (const rule of this.config.objectiveRules) {
      const when = rule.when || {};
      const tolerance = typeof rule.tolerance === 'number' ? rule.tolerance : 1;

      if (when.allWords) {
        const allMatched = when.allWords.every((group) =>
          words.some((word) => fuzzyMatch(word, group, tolerance))
        );
        if (allMatched) return rule.objective;
      }

      if (when.anyWords) {
        const anyMatched = when.anyWords.some((group) =>
          words.some((word) => fuzzyMatch(word, group, tolerance))
        );
        if (anyMatched) return rule.objective;
      }
    }
    return 'indefinido';
  }
}

export const defaultClassifier = new CampaignClassifierEngine();

// Date helpers
export function extractDateFromName(name: string): Date | null {
  const match = (name || '').match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]?(\d{2,4})?/);
  if (!match) return null;
  let year = match[3] ? +match[3] : new Date().getFullYear();
  if (year < 100) year += 2000;
  const d = new Date(year, +match[2] - 1, +match[1]);
  return isNaN(d.getTime()) ? null : d;
}

export function parseMetaDate(v: any): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (typeof v === 'number') {
    const parsed = XLSX.SSF.parse_date_code(v);
    if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  if (!v) return null;
  const s = String(v).trim();
  const iso8 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (iso8) {
    const di = new Date(+iso8[1], +iso8[2] - 1, +iso8[3]);
    return isNaN(di.getTime()) ? null : di;
  }
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    let year = +m[3];
    if (year < 100) year += 2000;
    const d = new Date(year, +m[2] - 1, +m[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const iso = new Date(s);
  return isNaN(iso.getTime()) ? null : iso;
}

export function fmtValidity(dStart: Date | null, dEnd: Date | null): string {
  if (!dStart) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const d1 = pad(dStart.getDate()),
    m1 = pad(dStart.getMonth() + 1),
    y1 = dStart.getFullYear();
  if (!dEnd) return `${d1}/${m1}/${y1}`;
  const d2 = pad(dEnd.getDate()),
    m2 = pad(dEnd.getMonth() + 1),
    y2 = dEnd.getFullYear();
  const diffDays = Math.round((dEnd.getTime() - dStart.getTime()) / 86400000);
  const conector = diffDays <= 1 ? ' e ' : ' a ';
  if (m1 === m2 && y1 === y2) {
    return diffDays <= 1 ? `${d1} e ${d2}/${m2}/${y2}` : `${d1} a ${d2}/${m2}/${y2}`;
  }
  if (y1 === y2) return `${d1}/${m1}${conector}${d2}/${m2}/${y2}`;
  return `${d1}/${m1}/${y1}${conector}${d2}/${m2}/${y2}`;
}

export function formatActionName(name: string, objective: ObjectiveType): string {
  if (!name) return '';
  const parts = name.split(/\s*[-–]\s*/);
  const DATE_PATTERN = /^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/;
  const FORMAT_BASE_REGEX = /^(carrossel|carrosel|panfleto|panfletos|tabloide|tabloides|post|reels|reel|video|vídeo|virtual|virtuais)$/i;

  const OBJ_ABBREV: Record<string, string> = {
    alc: 'Alcance',
    al: 'Alcance',
    alcance: 'Alcance',
    eng: 'Engajamento',
    engaj: 'Engajamento',
    engajamento: 'Engajamento',
    whats: 'WhatsApp',
    whatsapp: 'WhatsApp',
    wpp: 'WhatsApp',
    zap: 'WhatsApp',
    wats: 'WhatsApp',
    traf: 'Tráfego',
    trafego: 'Tráfego',
    link: 'Link',
    views: 'Visualização',
    thruplay: 'ThruPlay',
    conv: 'Conversas',
    conversas: 'Conversas'
  };

  const cleaned: string[] = [];
  let foundObj = false;

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i].trim();
    if (!segment) continue;
    if (DATE_PATTERN.test(segment)) continue;
    if (FORMAT_BASE_REGEX.test(segment)) continue;

    const segLower = segment.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (OBJ_ABBREV[segLower]) {
      cleaned.push(OBJ_ABBREV[segLower]);
      foundObj = true;
      continue;
    }
    cleaned.push(segment);
  }

  if (!foundObj && objective && objective !== 'indefinido') {
    const OBJ_DISPLAY: Partial<Record<ObjectiveType, string>> = {
      Alc: 'Alcance',
      Eng: 'Engajamento',
      EngLink: 'Engajamento + Link',
      EngWhats: 'Eng + Whats',
      TrafLink: 'Tráfego + Link',
      TrafWhats: 'Tráfego + Whats',
      ReelsAlc: 'Reels Alcance',
      ReelsEng: 'Reels Engajamento',
      ReelsEngLink: 'Reels Eng + Link',
      ReelsEngWhats: 'Reels Eng + Whats',
      ReelsTrafLink: 'Reels Tráfego + Link',
      ReelsTrafWhats: 'Reels Tráfego + Whats'
    };
    if (OBJ_DISPLAY[objective]) {
      cleaned.push(OBJ_DISPLAY[objective]!);
    }
  }

  return cleaned.join(' - ');
}

export function parseCurrency(v: any): number {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  let s = String(v).trim();
  if (s === '' || s === '-' || s === '–' || s === '—') return 0;
  s = s.replace(/[R$\s]/g, '');
  if (s.indexOf(',') !== -1) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(s) || 0;
}

export function parseFileName(filename: string): ReportMeta {
  const base = filename.replace(/\.[^.]+$/, '').trim();
  const MESES: Record<string, string> = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro',
    jan: 'Janeiro',
    fev: 'Fevereiro',
    mar: 'Março',
    abr: 'Abril',
    mai: 'Maio',
    jun: 'Junho',
    jul: 'Julho',
    ago: 'Agosto',
    set: 'Setembro',
    out: 'Outubro',
    nov: 'Novembro',
    dez: 'Dezembro',
    janeiro: 'Janeiro',
    fevereiro: 'Fevereiro',
    março: 'Março',
    marco: 'Março',
    abril: 'Abril',
    maio: 'Maio',
    junho: 'Junho',
    julho: 'Julho',
    agosto: 'Agosto',
    setembro: 'Setembro',
    outubro: 'Outubro',
    novembro: 'Novembro',
    dezembro: 'Dezembro'
  };

  const parts = base.split(/\s*[-–_]\s*/).map((p) => p.trim()).filter(Boolean);
  let cliente = '';
  let mes = '';
  let ano = '';

  parts.forEach((p) => {
    const pl = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/^\d{4}$/.test(p)) {
      ano = p;
      return;
    }
    if (MESES[pl]) {
      mes = MESES[pl];
      return;
    }
    if (!cliente && !/relatorio|impulsionamento|meta|ads/i.test(p)) {
      cliente = p;
    }
  });

  if (!mes || !ano) {
    parts.forEach((p) => {
      const pl = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      for (const k in MESES) {
        if (pl.includes(k) && k.length > 2) {
          mes = MESES[k];
          break;
        }
      }
      const ym = p.match(/\b(20\d{2})\b/);
      if (ym) ano = ym[1];
    });
  }

  if (!cliente) cliente = parts[0] || 'Cliente Exemplo';
  if (!ano) ano = new Date().getFullYear().toString();
  if (!mes) mes = 'Mês Vigente';

  return { cliente, mes, ano, originalFileName: filename };
}

// Index helper for columns
function getIdx(headers: string[], keywords: string[]): number {
  const exact = headers.findIndex((header) => keywords.some((keyword) => header === keyword));
  if (exact >= 0) return exact;
  return headers.findIndex((header) => keywords.some((keyword) => header.includes(keyword)));
}

export function parseExcelWorkbook(wb: XLSX.WorkBook): CampaignRow[] {
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
  if (!rows || !rows.length) throw new Error('O arquivo de planilha está vazio.');

  let headerRowIdx = 0;
  for (let hi = 0; hi < Math.min(6, rows.length); hi++) {
    const firstCell = String(rows[hi][0] || '').toLowerCase().trim();
    const rowStr = rows[hi].join(' ').toLowerCase();
    if (firstCell.includes('campanha') || firstCell.includes('campaign') || rowStr.includes('nome da campanha') || rowStr.includes('valor usado')) {
      headerRowIdx = hi;
      break;
    }
  }

  const headers = rows[headerRowIdx].map((h) =>
    String(h || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  );

  const iCN = getIdx(headers, ['nome da campanha', 'campaign name']);
  const iAN = getIdx(headers, ['nome do anuncio', 'ad name']);
  const iCA = getIdx(headers, ['nome do conjunto de anuncios', 'ad set name', 'conjunto de anuncios', 'nome do conjunto']);
  const iDI = getIdx(headers, ['inicio dos relatorios', 'inicio', 'start', 'data de inicio']);
  const iDT = getIdx(headers, ['termino dos relatorios', 'termino', 'end', 'data de termino']);
  const iB = getIdx(headers, ['orcamento da campanha', 'campaign budget', 'orcamento', 'investimento']);
  const iS = getIdx(headers, ['valor usado (brl)', 'valor usado', 'amount spent', 'valor gasto']);
  const iR = getIdx(headers, ['alcance', 'reach']);
  const iIm = getIdx(headers, ['impressoes', 'impressions']);
  const iEP = getIdx(headers, ['engajamentos com o post', 'post engagements', 'engajamento']);
  const iLC = getIdx(headers, ['cliques no link', 'link clicks']);
  const iThru = getIdx(headers, ['thruplays', 'thruplay', 'visualizacao (thruplay)', 'visualizacoes']);
  const iCPM = getIdx(headers, ['cpm (custo por 1.000 impressoes)', 'cpm', 'custo por 1.000 impressoes', 'custo por 1.000 pessoas']);
  const iCPC = getIdx(headers, ['cpc (custo por clique no link)', 'cpc (custo por clique)', 'custo por clique no link', 'cpc']);
  const iCThru = getIdx(headers, ['custo por thruplay', 'cost per thruplay']);
  const iCInt = getIdx(headers, ['custo por engajamento com o post', 'cost per post engagement', 'custo por interacao']);
  const iCConv = getIdx(headers, ['custo por conversa por mensagem iniciada', 'cost per messaging conversation started', 'custo por conversa']);
  const iConv = getIdx(headers, ['conversas por mensagem iniciadas', 'messaging conversations started', 'conversas iniciadas']);
  const iRes = getIdx(headers, ['resultados', 'results', 'result']);
  const iCPR = getIdx(headers, ['custo por resultado', 'cost per result']);
  const iTRes = getIdx(headers, ['tipo de resultado']);
  const iFiltro = getIdx(headers, ['filtro', 'filter']);
  const iCidade = getIdx(headers, ['cidade', 'city', 'municipio', 'localizacao', 'location']);

  const g = (row: any[], idx: number): string => {
    if (idx < 0 || idx >= row.length) return '';
    const val = row[idx];
    if (val === null || val === undefined) return '';
    const t = String(val).trim();
    if (t === '–' || t === '—' || t === '-' || t === '') return '';
    return t;
  };

  const safeNum = (row: any[], idx: number): number => {
    const v = g(row, idx);
    if (!v) return 0;
    return parseCurrency(v);
  };

  const data: CampaignRow[] = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row.length) continue;
    const nameRaw = g(row, iCN);
    if (!nameRaw || String(nameRaw).trim() === '') continue;

    const nameLow = String(nameRaw).toLowerCase();
    if (nameLow.includes('total') && nameRaw.length < 25) continue;

    const name = String(nameRaw).trim();
    const adName = String(g(row, iAN) || g(row, iCA) || '').trim();

    const format = defaultClassifier.detectFormat(name, adName);
    let objective = defaultClassifier.detectObjective(name, format);

    const dateFromName = extractDateFromName(name);
    const dStart = parseMetaDate(g(row, iDI));
    const dEnd = parseMetaDate(g(row, iDT));
    let validity = '';
    if (dStart) validity = fmtValidity(dStart, dEnd);
    else if (dateFromName) validity = fmtValidity(dateFromName, null);

    const sortDate = dateFromName || dStart;
    const spent = safeNum(row, iS);
    const budget = safeNum(row, iB);
    const reach = Math.round(safeNum(row, iR));
    const impr = Math.round(safeNum(row, iIm));

    const resultados = Math.round(safeNum(row, iRes));
    const custoRes = safeNum(row, iCPR);

    const tipoRes = String(g(row, iTRes) || '').toLowerCase();
    const isClique = tipoRes.includes('clique') || tipoRes.includes('link');
    const isThruplay = tipoRes.includes('thruplay') || tipoRes.includes('visuali');
    const isConversa = tipoRes.includes('conversa') || tipoRes.includes('mensagem');
    const isEngajamento = tipoRes.includes('interac') || tipoRes.includes('engaj');

    let thru = Math.round(safeNum(row, iThru) || (isThruplay ? resultados : 0));
    let eng = Math.round(safeNum(row, iEP) || (isEngajamento ? resultados : 0));
    let links = Math.round(safeNum(row, iLC) || (isClique ? resultados : 0));
    let conv = Math.round(safeNum(row, iConv) || (isConversa ? resultados : 0));

    // Regra mandatória solicitada pelo usuário:
    // Se constar Whats ou WhatsApp (ou termos relacionados como zap, wpp, wats) e a campanha gerar conversa,
    // o objetivo dela é "Engajamento Conversa de Whats" (EngWhats ou ReelsEngWhats para Reels).
    const isWhatsTerm = /whats|whatsapp|wpp|zap|wats/i.test(name) || /whats|whatsapp|wpp|zap|wats/i.test(adName);
    const isReels = /^Reels/i.test(format) || /reels|reel/i.test(name);
    if (isWhatsTerm && (conv > 0 || isConversa)) {
      objective = isReels ? 'ReelsEngWhats' : 'EngWhats';
    }

    const isAlcanceCampaign = objective === 'Alc' || objective === 'ReelsAlc';
    if (!eng && !links && !thru && !conv && resultados > 0 && !isAlcanceCampaign && resultados !== reach) {
      eng = resultados;
    }

    let cpm = safeNum(row, iCPM);
    if (!cpm && impr > 0 && spent > 0) cpm = (spent / impr) * 1000;

    let cpc = safeNum(row, iCPC);
    if (!cpc && isClique) cpc = custoRes || (links > 0 && spent > 0 ? spent / links : 0);
    if (!cpc && links > 0 && spent > 0) cpc = spent / links;

    let cThru = safeNum(row, iCThru);
    if (!cThru && isThruplay) cThru = custoRes || (thru > 0 && spent > 0 ? spent / thru : 0);
    if (!cThru && thru > 0 && spent > 0) cThru = spent / thru;

    let cInt = safeNum(row, iCInt);
    if (!cInt && isEngajamento) cInt = custoRes || (eng > 0 && spent > 0 ? spent / eng : 0);
    if (!cInt && custoRes > 0 && eng > 0) cInt = custoRes;
    if (!cInt && eng > 0 && spent > 0) cInt = spent / eng;

    let cConv = safeNum(row, iCConv);
    if (!cConv && isConversa) cConv = custoRes || (conv > 0 && spent > 0 ? spent / conv : 0);
    if (!cConv && conv > 0 && spent > 0) cConv = spent / conv;

    data.push({
      id: `camp_${i}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      displayName: formatActionName(name, objective),
      format,
      objective,
      validity,
      sortDate: sortDate ? sortDate.toISOString() : null,
      budget,
      spent,
      reach,
      impr,
      eng,
      links,
      views: thru,
      conv,
      cpm,
      cpc,
      cThru,
      cInt,
      cConv,
      filtro: g(row, iFiltro) || '',
      cidade: g(row, iCidade) || ''
    });
  }

  sortCampaignRows(data);
  return data;
}

export function sortCampaignRows(data: CampaignRow[]): void {
  data.sort((a, b) => {
    const da = extractDateFromName(a.name) || (a.sortDate ? new Date(a.sortDate) : null);
    const db = extractDateFromName(b.name) || (b.sortDate ? new Date(b.sortDate) : null);
    const ta = da ? da.getTime() : 0;
    const tb = db ? db.getTime() : 0;
    if (ta !== tb) return ta - tb;
    const pa = DEFAULT_CLASSIFIER_CONFIG.objectivePriority[a.objective] || 999;
    const pb = DEFAULT_CLASSIFIER_CONFIG.objectivePriority[b.objective] || 999;
    return pa - pb;
  });
}

// Sample demo dataset for immediate test without needing to upload an .xlsx
export function getSampleDemoData(): { meta: ReportMeta; rows: CampaignRow[]; capa: CapaData } {
  const meta: ReportMeta = {
    cliente: 'Supermercado Nova Estrela',
    mes: 'Outubro',
    ano: '2026',
    originalFileName: 'Supermercado Nova Estrela - Outubro 2026 - Meta Ads.xlsx'
  };

  const capa: CapaData = {
    fb: {
      seguidores: '18.420',
      segAnterior: '17.890',
      homens: '34%',
      mulheres: '66%',
      faixa: '25 a 54 anos',
      alcancadas: '48.910',
      visitas: '3.420'
    },
    ig: {
      seguidores: '42.850',
      segAnterior: '39.710',
      homens: '28%',
      mulheres: '72%',
      faixa: '25 a 44 anos',
      alcancadas: '112.400',
      visitas: '14.890'
    }
  };

  const rows: CampaignRow[] = [
    {
      id: 'demo_1',
      name: '02/10 - Panfleto Virtual - Alcance - Supermercado Nova Estrela',
      displayName: 'Panfleto Virtual - Alcance',
      format: 'Panfleto',
      objective: 'Alc',
      validity: '02 a 05/10/2026',
      budget: 150.0,
      spent: 148.5,
      reach: 24300,
      impr: 38200,
      eng: 0,
      links: 0,
      views: 0,
      conv: 0,
      cpm: 3.89,
      cpc: 0,
      cThru: 0,
      cInt: 0,
      cConv: 0,
      filtro: '18 a 65 anos • Raio 5km',
      cidade: 'Três Lagoas - MS'
    },
    {
      id: 'demo_2',
      name: '05/10 - Carrossel Ofertas Hortifruti - Engajamento - Quarta Verde',
      displayName: 'Carrossel Ofertas Hortifruti - Engajamento',
      format: 'Carrossel',
      objective: 'Eng',
      validity: '05 e 06/10/2026',
      budget: 120.0,
      spent: 120.0,
      reach: 19800,
      impr: 29500,
      eng: 1420,
      links: 0,
      views: 0,
      conv: 0,
      cpm: 4.07,
      cpc: 0,
      cThru: 0,
      cInt: 0.084,
      cConv: 0,
      filtro: '25 a 55 anos • Raio 3km',
      cidade: 'Três Lagoas - MS'
    },
    {
      id: 'demo_3',
      name: '10/10 - Panfleto Virtual - Trafego Whats - Clube de Descontos',
      displayName: 'Panfleto Virtual - Engajamento Whats',
      format: 'Panfleto',
      objective: 'EngWhats',
      validity: '10 a 14/10/2026',
      budget: 200.0,
      spent: 197.3,
      reach: 22400,
      impr: 34100,
      eng: 0,
      links: 0,
      views: 0,
      conv: 142,
      cpm: 5.78,
      cpc: 0,
      cThru: 0,
      cInt: 0,
      cConv: 1.39,
      filtro: '18 a 60 anos • Raio 7km',
      cidade: 'Três Lagoas - MS'
    },
    {
      id: 'demo_4',
      name: '15/10 - Reels - Receita Especial Picanha & Churrasco - Engajamento',
      displayName: 'Reels - Receita Churrasco - Reels Engajamento',
      format: 'Reels',
      objective: 'ReelsEng',
      validity: '15 a 18/10/2026',
      budget: 180.0,
      spent: 179.8,
      reach: 34200,
      impr: 52100,
      eng: 3840,
      links: 0,
      views: 18900,
      conv: 0,
      cpm: 3.45,
      cpc: 0,
      cThru: 0.0095,
      cInt: 0.047,
      cConv: 0,
      filtro: '20 a 50 anos • Raio 5km',
      cidade: 'Três Lagoas - MS'
    },
    {
      id: 'demo_5',
      name: '20/10 - Post - Ofertas de Carnes & Cervejas - Engajamento Link',
      displayName: 'Post - Ofertas Carnes - Engajamento + Link',
      format: 'Post',
      objective: 'EngLink',
      validity: '20 a 22/10/2026',
      budget: 160.0,
      spent: 159.2,
      reach: 21600,
      impr: 33400,
      eng: 1960,
      links: 870,
      views: 0,
      conv: 0,
      cpm: 4.76,
      cpc: 0.183,
      cThru: 0,
      cInt: 0.081,
      cConv: 0,
      filtro: '22 a 55 anos • Raio 4km',
      cidade: 'Três Lagoas - MS'
    },
    {
      id: 'demo_6',
      name: '26/10 - Reels - Fim de Mes Imbativel - Trafego Whats',
      displayName: 'Reels - Fim de Mês - Reels Engajamento Whats',
      format: 'Reels',
      objective: 'ReelsEngWhats',
      validity: '26 a 31/10/2026',
      budget: 250.0,
      spent: 248.9,
      reach: 38900,
      impr: 61200,
      eng: 2150,
      links: 0,
      views: 24600,
      conv: 188,
      cpm: 4.06,
      cpc: 0,
      cThru: 0.0101,
      cInt: 0.115,
      cConv: 1.32,
      filtro: '18 a 65 anos • Raio 5km',
      cidade: 'Três Lagoas - MS'
    }
  ];

  return { meta, rows, capa };
}

export interface PillarCategories {
  alcance: CampaignRow[];
  engajamentoTrafego: CampaignRow[];
  reels: CampaignRow[];
}

export function categorizeCampaignPillars(campaigns: CampaignRow[]): PillarCategories {
  const reels: CampaignRow[] = [];
  const alcance: CampaignRow[] = [];
  const engajamentoTrafego: CampaignRow[] = [];

  campaigns.forEach((c) => {
    const isReels = /^Reels/i.test(c.objective) || /reels|vídeo|video/i.test(c.format) || c.views > 0;
    if (isReels) {
      reels.push(c);
    } else if (c.objective === 'Alc' || (/alcance/i.test(c.name) && !c.conv && !c.links && !c.eng)) {
      alcance.push(c);
    } else {
      engajamentoTrafego.push(c);
    }
  });

  return { alcance, engajamentoTrafego, reels };
}

