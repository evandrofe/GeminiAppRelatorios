export type ObjectiveType =
  | 'Alc'
  | 'Eng'
  | 'EngLink'
  | 'EngWhats'
  | 'TrafLink'
  | 'TrafWhats'
  | 'ReelsAlc'
  | 'ReelsEng'
  | 'ReelsEngLink'
  | 'ReelsEngWhats'
  | 'ReelsTrafLink'
  | 'ReelsTrafWhats'
  | 'indefinido';

export interface CampaignRow {
  id: string;
  name: string;
  displayName: string;
  format: string;
  objective: ObjectiveType;
  validity: string;
  sortDate?: string | null;
  budget: number;
  spent: number;
  reach: number;
  impr?: number;
  eng: number;
  links: number;
  views: number;
  conv: number;
  cpm: number;
  cpc: number;
  cThru: number;
  cInt: number;
  cConv: number;
  filtro?: string;
  cidade?: string;
  aiNotes?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface SocialMetrics {
  seguidores: string;
  segAnterior: string;
  homens: string;
  mulheres: string;
  faixa: string;
  alcancadas: string;
  visitas: string;
}

export interface CapaData {
  fb: SocialMetrics;
  ig: SocialMetrics;
}

export interface ReportMeta {
  cliente: string;
  mes: string;
  ano: string;
  originalFileName: string;
}

export interface ClassifierConfig {
  normalizationAliases: Record<string, string[]>;
  formatKeywords: Array<{
    keyword: string;
    label: string;
    aliases?: string[];
  }>;
  objectivePriority: Record<string, number>;
  objectiveRules: Array<{
    name: string;
    objective: ObjectiveType;
    aliases?: string[];
    tolerance?: number | null;
    when: {
      allWords?: string[][];
      anyWords?: string[][];
      noneWords?: string[][];
      textRegex?: string;
      textIncludes?: string[][];
      formatIn?: string[];
      tolerance?: number;
    };
  }>;
}

export interface GeminiAnalysisResult {
  executiveSummary: string;
  keyHighlights: string[];
  pointsOfAttention: string[];
  channelEvaluation: {
    facebookVsInstagram: string;
    topFormats: string;
    cpmAnalysis: string;
  };
  clientMessageWhatsapp: string;
  strategicRecommendations: string[];
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}
