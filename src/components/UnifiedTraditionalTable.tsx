import React, { useState, useMemo } from 'react';
import {
  Search,
  HelpCircle,
  TrendingUp,
  DollarSign,
  Users,
  MessageCircle,
  Video,
  MousePointerClick,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Filter,
  Layers,
  Target,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import { CampaignRow, ReportMeta } from '../types';
import { extractDateFromName } from '../lib/metaAdsParser';

interface UnifiedTraditionalTableProps {
  campaigns: CampaignRow[];
  meta: ReportMeta;
  totalBudget: number;
  totalSpent: number;
  totalReach: number;
  totalInt: number;
  totalLinks: number;
  totalViews: number;
  totalConv: number;
}

const fmtBRL = (val: number | undefined): string => {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const fmtNum = (val: number | undefined): string => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return val.toLocaleString('pt-BR');
};

const titleCase = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
};

interface ColumnInfo {
  num: number;
  name: string;
  short: string;
  category: 'setup' | 'financeiro' | 'topo' | 'meio' | 'fundo' | 'geo';
  stage: string;
  stageColor: string;
  badge: string;
  meaning: string;
  importance: string;
  formula?: string;
  tip: string;
  idealFor: string;
}

export const COLUMNS_17_GUIDE: ColumnInfo[] = [
  {
    num: 1,
    name: 'Nome da Ação',
    short: 'Nome da Ação',
    category: 'setup',
    stage: 'Identificação & Setup',
    stageColor: 'text-neutral-400 bg-neutral-800/80 border-neutral-700',
    badge: 'Controle Criativo',
    meaning: 'Identificação da peça publicitária, produto ou tema anunciado e a data de veiculação na Meta.',
    importance: 'Permite rastrear o histórico de cada encarte, promoção ou oferta temática. É a base para comparar quais produtos atraem mais atenção do público da sua cidade.',
    tip: 'Mantenha um padrão claro no nome (ex: "2026-10-15 - Panfleto Hortifruti").',
    idealFor: 'Organização e auditoria de anúncios'
  },
  {
    num: 2,
    name: 'Formato',
    short: 'Formato',
    category: 'setup',
    stage: 'Tipo de Mídia',
    stageColor: 'text-neutral-400 bg-neutral-800/80 border-neutral-700',
    badge: 'Mídia Visual',
    meaning: 'O tipo de formato criativo exibido (Panfleto Virtual, Post Estático, Carrossel de Ofertas, Vídeo / Reels).',
    importance: 'Cada formato se comporta de forma única no algoritmo da Meta: Reels retêm a atenção por mais tempo, Carrosséis incentivam folhear produtos e Panfletos geram impacto visual rápido no feed.',
    tip: 'Alterne formatos conforme a oferta: encartes com muitos itens pedem Carrossel; pratos e receitas pedem Reels.',
    idealFor: 'Estratégia de conteúdo e criativos'
  },
  {
    num: 3,
    name: 'Validade',
    short: 'Validade',
    category: 'setup',
    stage: 'Janela de Tempo',
    stageColor: 'text-neutral-400 bg-neutral-800/80 border-neutral-700',
    badge: 'Tempo de Campanha',
    meaning: 'Janela de dias em que o anúncio esteve ativo (data inicial até a data final de entrega).',
    importance: 'Fundamental para ofertas pontuais (ex: encartes de quinta a domingo). Garante que a empresa não gaste verba veiculando promoções cujos preços já expiraram na loja física.',
    tip: 'Ofertas com prazo curto geram senso de urgência ("só até domingo").',
    idealFor: 'Controle de promoções semanais'
  },
  {
    num: 4,
    name: 'Investimento',
    short: 'Investimento',
    category: 'financeiro',
    stage: 'Orçamento Programado',
    stageColor: 'text-amber-400 bg-amber-950/50 border-amber-800/40',
    badge: 'Budget Aprovado',
    meaning: 'Verba orçada e programada no plano de mídia mensal para aquela ação específica.',
    importance: 'Garante que o planejamento financeiro seja cumprido rigorosamente, sem estourar o orçamento total aprovado pelo cliente para o mês.',
    tip: 'Serve de parâmetro para saber se a Meta conseguiu entregar todo o valor previsto.',
    idealFor: 'Planejamento e governança de verba'
  },
  {
    num: 5,
    name: 'Valor Gasto',
    short: 'Valor Gasto',
    category: 'financeiro',
    stage: 'Financeiro Efetivo',
    stageColor: 'text-amber-400 bg-amber-950/60 border-amber-700/60',
    badge: 'Consumo Real Meta',
    meaning: 'Montante que a Meta Ads efetivamente consumiu e faturou na entrega do anúncio.',
    importance: 'É o valor financeiro real investido. Serve de denominador oficial para calcular o retorno sobre o investimento (ROI) e todos os custos unitários (CPM, CPC, Custo por Conversa).',
    formula: 'Total faturado pela Meta no ciclo da campanha',
    tip: 'Deve fechar o mais próximo possível do Investimento programado.',
    idealFor: 'Auditoria de gastos e cálculo de CAC/ROI'
  },
  {
    num: 6,
    name: 'Alcance',
    short: 'Alcance',
    category: 'topo',
    stage: 'Topo de Funil (Consciência)',
    stageColor: 'text-blue-400 bg-blue-950/60 border-blue-700/60',
    badge: 'Pessoas Únicas',
    meaning: 'Número total de pessoas físicas distintas (contas únicas no Instagram/Facebook) que viram o anúncio pelo menos 1 vez.',
    importance: 'Mede a amplitude da marca na cidade. Ao contrário das impressões (que contam repetições na mesma pessoa), o Alcance mede quantas pessoas reais foram informadas sobre sua loja ou promoção.',
    tip: 'Sem alcance forte no Topo do Funil, o restante das campanhas fica sem público para converter.',
    idealFor: 'Construção de marca e reconhecimento local'
  },
  {
    num: 7,
    name: 'Engajamento',
    short: 'Engajamento',
    category: 'meio',
    stage: 'Meio de Funil (Interesse)',
    stageColor: 'text-sky-400 bg-sky-950/60 border-sky-700/60',
    badge: 'Interações Ativas',
    meaning: 'Total de interações com o post: curtidas, reações, comentários, salvamentos e compartilhamentos com amigos.',
    importance: 'Mede o nível de conexão e receptividade da comunidade. Publicações com alto engajamento geram prova social forte e sinalizam à Meta que o criativo tem qualidade, o que barateia os custos de entrega.',
    tip: 'Em campanhas exclusivas de alcance, não duplica o valor do alcance para manter os dados fiéis.',
    idealFor: 'Prova social, reciprocidade e aquecimento'
  },
  {
    num: 8,
    name: 'Cliques no Link',
    short: 'Cliques Link',
    category: 'meio',
    stage: 'Meio de Funil (Tráfego)',
    stageColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/60',
    badge: 'Tráfego Externo',
    meaning: 'Quantidade de usuários que clicaram no botão para sair da rede social e acessar um endereço externo (site, encarte digital interativo, catálogo ou WhatsApp web).',
    importance: 'Mede o interesse qualificado em dar o próximo passo. O usuário que clica no link demonstrou intenção ativa de conhecer detalhes da oferta.',
    tip: 'Crucial para campanhas de encartes digitais interativos e lojas virtuais.',
    idealFor: 'Geração de tráfego e visualização de encarte'
  },
  {
    num: 9,
    name: 'Visualização (ThruPlay)',
    short: 'ThruPlay',
    category: 'meio',
    stage: 'Meio de Funil (Retenção)',
    stageColor: 'text-purple-400 bg-purple-950/60 border-purple-700/60',
    badge: 'Atenção Audiovisual',
    meaning: 'Vídeos ou Reels assistidos por pelo menos 15 segundos ou assistidos até o fim (caso o vídeo tenha menos de 15 segundos).',
    importance: 'É o padrão de excelência da Meta para vídeos. Descarta quem apenas rolou o feed sem prestar atenção e mede os espectadores reais que foram tocados pela mensagem ou receita da sua empresa.',
    tip: 'Pessoas que assistem 15s de um Reels têm propensão muito maior de se tornarem clientes fiéis.',
    idealFor: 'Reels, receitas, dicas e vídeos institucionais'
  },
  {
    num: 10,
    name: 'Custo por 1.000 Pessoas (CPM)',
    short: 'CPM',
    category: 'topo',
    stage: 'Eficiência de Topo',
    stageColor: 'text-blue-400 bg-blue-950/60 border-blue-700/60',
    badge: 'Custo de Propagação',
    meaning: 'Valor investido para fazer o anúncio alcançar 1.000 pessoas únicas na sua região geográfica.',
    importance: 'É o termômetro do leilão da Meta Ads. Indica se a entrega está barata ou cara. Um CPM baixo significa que a campanha está conseguindo espalhar a marca gastando muito pouco por pessoa.',
    formula: '(Valor Gasto ÷ Alcance) × 1.000',
    tip: 'No varejo alimentar e comércio local, manter o CPM entre R$ 3,00 e R$ 7,00 indica ótima eficiência.',
    idealFor: 'Avaliar o custo de entrega e escala'
  },
  {
    num: 11,
    name: 'Custo por Cliques Link (CPC)',
    short: 'CPC',
    category: 'meio',
    stage: 'Eficiência de Tráfego',
    stageColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-700/60',
    badge: 'Custo por Visitante',
    meaning: 'Preço médio pago para levar uma pessoa interessada da rede social até a página de destino da ação.',
    importance: 'Avalia a atratividade do anúncio e a força da chamada para ação (CTA). Se o CPC está baixo, significa que a oferta gerou alta curiosidade e o criativo foi certeiro.',
    formula: 'Valor Gasto ÷ Cliques no Link',
    tip: 'CPCs abaixo de R$ 0,50 no varejo são considerados excelentes.',
    idealFor: 'Otimização de páginas de destino e catálogos'
  },
  {
    num: 12,
    name: 'Custo por ThruPlay',
    short: 'Custo ThruPlay',
    category: 'meio',
    stage: 'Eficiência Audiovisual',
    stageColor: 'text-purple-400 bg-purple-950/60 border-purple-700/60',
    badge: 'Custo por Atenção',
    meaning: 'Valor pago por cada usuário que assistiu a 15 segundos ou ao vídeo completo do Reels.',
    importance: 'Mostra quanto custou prender a atenção de um cliente em potencial com conteúdo de vídeo. Custos de centavos (R$ 0,01 a R$ 0,03) tornam o Reels muito mais vantajoso que mídia tradicional.',
    formula: 'Valor Gasto ÷ Visualizações ThruPlay',
    tip: 'Se o Custo por ThruPlay estiver em R$ 0,01 ou R$ 0,02, o criativo teve excelente aceitação.',
    idealFor: 'Avaliar retorno de produção de vídeos e Reels'
  },
  {
    num: 13,
    name: 'Custo por Interação',
    short: 'Custo Interação',
    category: 'meio',
    stage: 'Eficiência de Envolvimento',
    stageColor: 'text-sky-400 bg-sky-950/60 border-sky-700/60',
    badge: 'Custo por Reação',
    meaning: 'Valor médio investido para gerar cada curtida, comentário, compartilhamento ou envolvimento geral.',
    importance: 'Permite comparar quais tipos de postagens (sorteios, dicas, novidades) mobilizam a comunidade com o menor custo de investimento.',
    formula: 'Valor Gasto ÷ Total de Engajamentos',
    tip: 'Útil para calibrar a linha editorial e saber o que mais desperta interesse no feed.',
    idealFor: 'Linha editorial e engajamento comunitário'
  },
  {
    num: 14,
    name: 'Custo por Conversa',
    short: 'Custo Conversa',
    category: 'fundo',
    stage: 'Eficiência de Vendas',
    stageColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60',
    badge: 'Custo de Aquisição (CAC)',
    meaning: 'Valor que precisou ser investido para fazer 1 novo cliente abrir um chat comercial no WhatsApp.',
    importance: 'Uma das métricas mais vitais do negócio. Diz quanto custa colocar um cliente pronto para comprar na mão dos seus vendedores ou atendentes.',
    formula: 'Valor Gasto ÷ Conversas Iniciadas',
    tip: 'Se a sua margem por cliente é boa, pagar R$ 1,00 a R$ 3,00 por conversa gera um retorno financeiro estrondoso.',
    idealFor: 'Geração de vendas, cotações e orçamentos'
  },
  {
    num: 15,
    name: 'Filtro',
    short: 'Filtro',
    category: 'setup',
    stage: 'Segmentação',
    stageColor: 'text-neutral-400 bg-neutral-800/80 border-neutral-700',
    badge: 'Público-Alvo',
    meaning: 'Configurações de segmentação aplicadas na Meta: raio em quilômetros ao redor da loja, faixa etária, gênero e interesses.',
    importance: 'Protege a verba da empresa garantindo que os anúncios sejam vistos exclusivamente por pessoas com perfil e capacidade de comprar na loja.',
    tip: 'No varejo físico, o raio geográfico bem calibrado (ex: 3 km a 8 km) é a configuração que mais evita desperdício.',
    idealFor: 'Precisão e proteção orçamentária'
  },
  {
    num: 16,
    name: 'Cidade',
    short: 'Cidade',
    category: 'setup',
    stage: 'Geolocalização',
    stageColor: 'text-neutral-400 bg-neutral-800/80 border-neutral-700',
    badge: 'Praça Comercial',
    meaning: 'Município, bairro ou região onde a veiculação dos anúncios foi concentrada.',
    importance: 'Garante que os clientes impactados estejam na área de atuação da loja física ou do serviço de delivery da empresa.',
    tip: 'Permite que empresas com múltiplas filiais comparem o desempenho entre cidades diferentes.',
    idealFor: 'Análise de praça e penetração territorial'
  },
  {
    num: 17,
    name: 'Conversas Iniciadas',
    short: 'Conversas Whats',
    category: 'fundo',
    stage: 'Fundo de Funil (Conversão)',
    stageColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60',
    badge: 'Leads & Vendas Reais',
    meaning: 'Total de clientes que clicaram no anúncio e enviaram uma mensagem inicial no WhatsApp da loja.',
    importance: 'É o objetivo final de conversão: reflete contatos comerciais diretos, pedidos de delivery, cotações e novas vendas geradas para a empresa.',
    tip: 'Fundo de Funil puro: esse resultado é maximizado quando a loja também investe em Alcance e Reels para aquecer o público.',
    idealFor: 'Vendas diretas, atendimento e novos clientes'
  }
];

export const UnifiedTraditionalTable: React.FC<UnifiedTraditionalTableProps> = ({
  campaigns,
  meta,
  totalBudget,
  totalSpent,
  totalReach,
  totalInt,
  totalLinks,
  totalViews,
  totalConv
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuideTab, setActiveGuideTab] = useState<'all' | 'topo' | 'meio' | 'fundo' | 'setup'>('all');
  const [selectedColumn, setSelectedColumn] = useState<ColumnInfo | null>(null);

  // Filter campaigns based on search query
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.displayName && c.displayName.toLowerCase().includes(q)) ||
        (c.format && c.format.toLowerCase().includes(q)) ||
        (c.objective && c.objective.toLowerCase().includes(q))
    );
  }, [campaigns, searchQuery]);

  // Filter guide columns
  const filteredGuide = useMemo(() => {
    if (activeGuideTab === 'all') return COLUMNS_17_GUIDE;
    if (activeGuideTab === 'setup') {
      return COLUMNS_17_GUIDE.filter((c) => c.category === 'setup' || c.category === 'financeiro');
    }
    return COLUMNS_17_GUIDE.filter((c) => c.category === activeGuideTab);
  }, [activeGuideTab]);

  let lastDateKey = '';

  return (
    <div className="space-y-8">
      {/* ====================================================================== */}
      {/* 1. MODERN EXECUTIVE TABLE CARD */}
      {/* ====================================================================== */}
      <div className="bg-[#141518] rounded-2xl border border-[#2b2d33] shadow-2xl overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#181a20] via-[#1c1e26] to-[#181a20] border-b border-[#2b2d33] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Matriz Unificada Tradicional
              </span>
              <span className="text-[11px] text-neutral-400">
                17 Colunas Completas Meta Ads • {campaigns.length} Ações Registradas
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Ações Mensais do Período</span>
              <span className="text-xs font-normal text-neutral-400">
                ({meta.mes} {meta.ano})
              </span>
            </h3>
          </div>

          {/* Quick Search & Indicators */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome ou formato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111215] border border-[#2b2d33] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <a
              href="#guia-funil-17-colunas"
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Guia & Legenda</span>
            </a>
          </div>
        </div>

        {/* The 17-Column Table */}
        <div className="overflow-x-auto max-h-[750px] scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
          <table className="w-full border-collapse text-[11px] font-sans">
            <thead className="sticky top-0 z-20 bg-[#1a1c22] shadow-md border-b-2 border-neutral-700">
              <tr className="text-neutral-300 font-bold uppercase tracking-tight text-[9px] select-none">
                <th
                  className="py-3 px-3 border-r border-[#2b2d33] text-left whitespace-nowrap min-w-[230px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 1: Nome da Ação - Identificação do anúncio, oferta e data"
                >
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">1</span>
                    <span>Nome da Ação</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-center whitespace-nowrap min-w-[90px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 2: Formato - Tipo de criativo (Panfleto, Carrossel, Reels, Post)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">2</span>
                    <span>Formato</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-center whitespace-nowrap min-w-[95px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 3: Validade - Janela de veiculação em dias da campanha"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">3</span>
                    <span>Validade</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[95px] bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 transition-colors"
                  title="Coluna 4: Investimento - Orçamento financeiro programado para a ação"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-amber-900/60 text-amber-300">4</span>
                    <span>Investimento</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[95px] bg-amber-950/30 hover:bg-amber-950/50 text-amber-300 font-extrabold transition-colors"
                  title="Coluna 5: Valor Gasto - Montante financeiro efetivamente consumido pela Meta"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-amber-900/80 text-amber-200">5</span>
                    <span>Valor Gasto</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[85px] bg-blue-950/20 hover:bg-blue-950/40 text-blue-300 transition-colors"
                  title="Coluna 6: Alcance - Pessoas físicas únicas impactadas (Topo do Funil)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-blue-900/60 text-blue-200">6</span>
                    <span>Alcance</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[85px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 7: Engajamento - Total de curtidas, comentários, salvamentos e reações"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">7</span>
                    <span>Engajamento</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[85px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 8: Cliques no Link - Tráfego direcionado para site, encarte ou link externo"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">8</span>
                    <span>Cliques Link</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[85px] bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 transition-colors"
                  title="Coluna 9: Visualização ThruPlay - Vídeos/Reels assistidos por no mínimo 15 segundos ou completos"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-200">9</span>
                    <span>ThruPlay</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[90px] bg-blue-950/20 hover:bg-blue-950/40 text-blue-300 transition-colors"
                  title="Coluna 10: Custo por 1.000 Pessoas (CPM) - Custo de propagação da marca"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-blue-900/60 text-blue-200">10</span>
                    <span>Custo / 1.000</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[90px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 11: Custo por Cliques Link (CPC) - Custo unitário por visitante gerado"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">11</span>
                    <span>Custo / Clique</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[90px] bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 transition-colors"
                  title="Coluna 12: Custo por ThruPlay - Custo por cada visualização de 15 segundos do vídeo"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-900/60 text-purple-200">12</span>
                    <span>Custo / ThruPlay</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[90px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 13: Custo por Interação - Custo unitário por curtida, comentário ou compartilhamento"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">13</span>
                    <span>Custo / Interação</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-r border-[#2b2d33] text-right whitespace-nowrap min-w-[95px] bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 transition-colors"
                  title="Coluna 14: Custo por Conversa - Custo unitário de aquisição por cliente no WhatsApp"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-emerald-900/60 text-emerald-200">14</span>
                    <span>Custo / Conversa</span>
                  </div>
                </th>
                <th
                  className="py-3 px-1.5 border-r border-[#2b2d33] text-center whitespace-nowrap min-w-[70px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 15: Filtro - Segmentação de raio, idade e interesses"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">15</span>
                    <span>Filtro</span>
                  </div>
                </th>
                <th
                  className="py-3 px-1.5 border-r border-[#2b2d33] text-center whitespace-nowrap min-w-[70px] hover:bg-neutral-800/80 transition-colors"
                  title="Coluna 16: Cidade - Praça geográfica da veiculação"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400">16</span>
                    <span>Cidade</span>
                  </div>
                </th>
                <th
                  className="py-3 px-2 border-b border-[#2b2d33] text-right whitespace-nowrap min-w-[95px] bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-300 font-extrabold transition-colors"
                  title="Coluna 17: Conversas Iniciadas - Novos clientes no WhatsApp (Fundo do Funil)"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-emerald-800 text-white">17</span>
                    <span>Conversas</span>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#23252b]">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-neutral-400 text-sm italic">
                    Nenhuma campanha encontrada com o filtro "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((r, idx) => {
                  const o = r.objective;
                  const isReels = /^Reels/i.test(o);
                  const isAlcanceOnly = o === 'Alc';
                  const curDate = extractDateFromName(r.name) || (r.sortDate ? new Date(r.sortDate) : null);
                  const curDateKey = curDate ? curDate.getTime() : 'none';

                  const showSeparator = idx > 0 && curDateKey !== lastDateKey;
                  lastDateKey = String(curDateKey);

                  const colReach = fmtNum(r.reach);

                  // Do not duplicate reach into engagement if campaign is Alcance or values are equal
                  const isDuplicateReach = r.reach > 0 && r.eng === r.reach;
                  const colEng =
                    isAlcanceOnly || isDuplicateReach
                      ? '—'
                      : o === 'Eng' ||
                        o === 'EngLink' ||
                        o === 'TrafLink' ||
                        o === 'ReelsEng' ||
                        o === 'ReelsEngLink' ||
                        o === 'ReelsTrafLink' ||
                        o === 'ReelsEngWhats' ||
                        o === 'ReelsTrafWhats'
                      ? fmtNum(r.eng)
                      : '—';

                  const colLinks =
                    o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink'
                      ? fmtNum(r.links)
                      : '—';

                  const colViews = isReels && r.views > 0 ? fmtNum(r.views) : '—';
                  const colCPM = o === 'Alc' && r.cpm > 0 ? fmtBRL(r.cpm) : '—';
                  const colCPC =
                    (o === 'EngLink' || o === 'TrafLink' || o === 'ReelsEngLink' || o === 'ReelsTrafLink') && r.cpc > 0
                      ? fmtBRL(r.cpc)
                      : '—';
                  const colThru =
                    (o === 'ReelsAlc' || o === 'ReelsEng' || o === 'ReelsEngLink' || o === 'ReelsTrafLink') && r.cThru > 0
                      ? fmtBRL(r.cThru)
                      : '—';
                  const colCInt = (o === 'Eng' || o === 'ReelsEng') && r.cInt > 0 ? fmtBRL(r.cInt) : '—';
                  const colCConv =
                    (o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats') && r.cConv > 0
                      ? fmtBRL(r.cConv)
                      : '—';
                  const colConv =
                    (o === 'EngWhats' || o === 'TrafWhats' || o === 'ReelsEngWhats' || o === 'ReelsTrafWhats') && r.conv > 0
                      ? fmtNum(r.conv)
                      : '—';

                  return (
                    <React.Fragment key={r.id}>
                      {showSeparator && (
                        <tr className="bg-[#101114] border-y border-[#2b2d33] h-2">
                          <td colSpan={17} className="h-2 p-0" />
                        </tr>
                      )}
                      <tr className="hover:bg-[#1a1c24] transition-colors group">
                        <td className="py-2.5 px-3 border-r border-[#23252b] text-left font-medium text-white group-hover:text-amber-200 transition-colors">
                          <span className="block">{titleCase(r.displayName || r.name)}</span>
                          {r.aiNotes && (
                            <span className="block text-[9px] text-amber-400/80 font-normal mt-0.5">
                              {r.aiNotes}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-center whitespace-nowrap text-neutral-300">
                          {r.format}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-center whitespace-nowrap text-neutral-400">
                          {r.validity || '—'}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-neutral-300">
                          {fmtBRL(r.budget)}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono font-bold text-amber-400 bg-amber-950/10">
                          {fmtBRL(r.spent)}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-blue-300 font-semibold bg-blue-950/10">
                          {colReach}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-neutral-300">
                          {colEng}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-neutral-300">
                          {colLinks}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-purple-300 font-semibold bg-purple-950/10">
                          {colViews}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-blue-300 bg-blue-950/10">
                          {colCPM}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-neutral-300">
                          {colCPC}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-purple-300 bg-purple-950/10">
                          {colThru}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-neutral-300">
                          {colCInt}
                        </td>
                        <td className="py-2.5 px-2 border-r border-[#23252b] text-right whitespace-nowrap font-mono text-emerald-300 bg-emerald-950/10">
                          {colCConv}
                        </td>
                        <td className="py-2.5 px-1.5 border-r border-[#23252b] text-center text-neutral-500 text-[10px]">
                          {r.filtro || '—'}
                        </td>
                        <td className="py-2.5 px-1.5 border-r border-[#23252b] text-center text-neutral-500 text-[10px]">
                          {r.cidade || '—'}
                        </td>
                        <td className="py-2.5 px-2 border-b border-[#23252b] text-right whitespace-nowrap font-mono font-bold text-emerald-400 bg-emerald-950/20">
                          {colConv !== '—' ? `${colConv} conv.` : '—'}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* Consolidated Totals Footer */}
            <tfoot className="sticky bottom-0 z-20 bg-[#16171d] border-t-2 border-amber-500 font-mono text-[10.5px]">
              <tr className="text-white font-bold">
                <td colSpan={3} className="py-3 px-3 border-r border-[#2b2d33] text-left uppercase font-sans tracking-wide">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Total Consolidado ({filteredCampaigns.length} ações)</span>
                  </div>
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-neutral-300">
                  {fmtBRL(totalBudget)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono font-black text-amber-300 bg-amber-950/30">
                  {fmtBRL(totalSpent)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono font-black text-blue-300 bg-blue-950/30">
                  {fmtNum(totalReach)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-neutral-300">
                  {fmtNum(totalInt)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-neutral-300">
                  {fmtNum(totalLinks)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono font-black text-purple-300 bg-purple-950/30">
                  {fmtNum(totalViews)}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-blue-300">
                  {totalReach > 0 ? fmtBRL((totalSpent / totalReach) * 1000) : '—'}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-neutral-300">
                  {totalLinks > 0 ? fmtBRL(totalSpent / totalLinks) : '—'}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-purple-300">
                  {totalViews > 0 ? fmtBRL(totalSpent / totalViews) : '—'}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-neutral-300">
                  {totalInt > 0 ? fmtBRL(totalSpent / totalInt) : '—'}
                </td>
                <td className="py-3 px-2 border-r border-[#2b2d33] text-right font-mono text-emerald-300">
                  {totalConv > 0 ? fmtBRL(totalSpent / totalConv) : '—'}
                </td>
                <td className="py-3 px-1.5 border-r border-[#2b2d33] text-center text-neutral-500 font-sans">
                  —
                </td>
                <td className="py-3 px-1.5 border-r border-[#2b2d33] text-center text-neutral-500 font-sans">
                  —
                </td>
                <td className="py-3 px-2 text-right font-mono font-black text-emerald-400 bg-emerald-950/40">
                  {totalConv > 0 ? `${totalConv} conv.` : '—'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. COMO UMA COISA LIGA A OUTRA — O FUNIL CONECTADO DO META ADS */}
      {/* ====================================================================== */}
      <div
        id="guia-funil-17-colunas"
        className="bg-[#141518] rounded-2xl border border-[#2b2d33] p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2d33] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Lógica Estratégica & Conexão de Resultados
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Como uma métrica se conecta com a outra no Meta Ads?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
              Nenhuma campanha atua isolada. O segredo de um tráfego de alta performance é entender que o dinheiro
              investido percorre um funil: do primeiro olhar na cidade até a mensagem de compra no WhatsApp.
            </p>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
            Visão Integrada de Funil
          </span>
        </div>

        {/* Visual 3-Stage Connected Funnel Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Topo de Funil */}
          <div className="bg-[#181a20] rounded-xl border border-blue-900/40 p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/40">
                  1. Topo de Funil
                </span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Atração & Consciência</h4>
                <p className="text-[11px] text-blue-200/80 font-medium mt-0.5">
                  Campanhas de Alcance & Reconhecimento
                </p>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <strong>O Papel:</strong> "Jogar a rede no mar." Fazer toda a cidade e bairro saberem que o supermercado
                está com ofertas ou novidades. Sem volume de pessoas no topo, o funil seca.
              </p>
              <div className="bg-[#111215] p-2.5 rounded-lg border border-neutral-800 text-[11px] space-y-1">
                <div className="text-neutral-400">
                  Métricas-Chave: <strong className="text-blue-300">Alcance (Col. 6)</strong> e{' '}
                  <strong className="text-blue-300">CPM (Col. 10)</strong>
                </div>
                <div className="text-neutral-500 text-[10px]">
                  Foco: Menor custo por mil pessoas atingidas. Não se cobra conversas diretas aqui.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
              <span>Alimenta a próxima etapa</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>

          {/* Meio de Funil */}
          <div className="bg-[#181a20] rounded-xl border border-purple-900/40 p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  2. Meio de Funil
                </span>
                <Video className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Interesse & Consideração</h4>
                <p className="text-[11px] text-purple-200/80 font-medium mt-0.5">
                  Reels, Vídeos, Engajamento e Tráfego
                </p>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <strong>O Papel:</strong> "O filtro de interesse." Nem todo mundo que vê vai comprar na hora. Os mais
                interessados assistem ao Reels de 15s, folheiam o carrossel ou clicam no encarte digital.
              </p>
              <div className="bg-[#111215] p-2.5 rounded-lg border border-neutral-800 text-[11px] space-y-1">
                <div className="text-neutral-400">
                  Métricas-Chave: <strong className="text-purple-300">ThruPlay (Col. 9)</strong>,{' '}
                  <strong className="text-cyan-300">Cliques (Col. 8)</strong>,{' '}
                  <strong className="text-sky-300">Engajamento (Col. 7)</strong>
                </div>
                <div className="text-neutral-500 text-[10px]">
                  Foco: Custo baixo por visualização completa (Col. 12) e por clique no link (Col. 11).
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
              <span>Aquece o lead para compra</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>

          {/* Fundo de Funil */}
          <div className="bg-[#181a20] rounded-xl border border-emerald-900/40 p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  3. Fundo de Funil
                </span>
                <MessageCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Ação & Vendas</h4>
                <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
                  Campanhas de Mensagens / WhatsApp
                </p>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                <strong>O Papel:</strong> "A colheita comercial." O cliente que já conhece a loja e viu as receitas/ofertas
                agora clica para pedir preço, cotar entrega ou reservar um produto direto com a equipe.
              </p>
              <div className="bg-[#111215] p-2.5 rounded-lg border border-neutral-800 text-[11px] space-y-1">
                <div className="text-neutral-400">
                  Métricas-Chave: <strong className="text-emerald-400">Conversas (Col. 17)</strong> e{' '}
                  <strong className="text-emerald-400">Custo por Conversa (Col. 14)</strong>
                </div>
                <div className="text-neutral-500 text-[10px]">
                  Foco: Volume de vendas diretas e oportunidades qualificadas geradas para a loja.
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[10px] text-emerald-400 flex items-center justify-between font-bold">
              <span>Resultado financeiro real</span>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Strategic Takeaway Box */}
        <div className="bg-[#181a20] rounded-xl border border-[#2b2d33] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-neutral-300">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">
              Por que cada pilar tem um objetivo diferente e como isso protege seu dinheiro?
            </h4>
            <p className="text-neutral-300 leading-relaxed text-[11.5px]">
              Se colocássemos 100% da verba apenas em campanhas de WhatsApp (Fundo), o custo por conversa subiria muito
              porque as pessoas da cidade não teriam confiança ou familiaridade. Ao investir em <strong>Alcance</strong> e{' '}
              <strong>Reels</strong>, a marca ganha notoriedade diária. Quando a campanha de WhatsApp é ativada, o cliente já
              está aquecido — <em>o que derruba o custo por conversa e aumenta a taxa de fechamento no balcão!</em>
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. DICIONÁRIO COMPLETO DAS 17 COLUNAS DA PLANILHA */}
      {/* ====================================================================== */}
      <div className="bg-[#141518] rounded-2xl border border-[#2b2d33] p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b2d33] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Glossário Técnico & Executivo
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              O que cada uma das 17 colunas significa e por que é importante?
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl">
              Consulte abaixo a descrição didática de cada coluna da planilha, por que ela é indispensável para o cliente
              e como analisar seus números com precisão.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-center">
            <button
              onClick={() => setActiveGuideTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGuideTab === 'all'
                  ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Todas (17)
            </button>
            <button
              onClick={() => setActiveGuideTab('setup')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGuideTab === 'setup'
                  ? 'bg-amber-500 text-neutral-950 font-extrabold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Setup & Verba (1 a 5)
            </button>
            <button
              onClick={() => setActiveGuideTab('topo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGuideTab === 'topo'
                  ? 'bg-blue-600 text-white font-extrabold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Alcance / CPM (6 e 10)
            </button>
            <button
              onClick={() => setActiveGuideTab('meio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGuideTab === 'meio'
                  ? 'bg-purple-600 text-white font-extrabold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              Engajamento / Vídeos (7 a 13)
            </button>
            <button
              onClick={() => setActiveGuideTab('fundo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeGuideTab === 'fundo'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              WhatsApp & Vendas (14 e 17)
            </button>
          </div>
        </div>

        {/* 17 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuide.map((col) => (
            <div
              key={col.num}
              className="bg-[#181a20] rounded-xl border border-[#2b2d33] hover:border-amber-500/40 p-4 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 font-mono text-xs font-black text-amber-400 flex items-center justify-center">
                      {col.num}
                    </span>
                    <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {col.name}
                    </h4>
                  </div>
                  <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${col.stageColor}`}>
                    {col.badge}
                  </span>
                </div>

                {/* Meaning */}
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    O que significa:
                  </span>
                  <p>{col.meaning}</p>
                </div>

                {/* Importance */}
                <div className="text-xs text-neutral-300 leading-relaxed bg-[#121317] p-2.5 rounded-lg border border-[#22242a]">
                  <span className="text-amber-400/90 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                    Por que é importante para o seu negócio:
                  </span>
                  <p className="text-neutral-300 text-[11px]">{col.importance}</p>
                </div>

                {/* Formula if exists */}
                {col.formula && (
                  <div className="text-[10.5px] text-neutral-400 flex items-center gap-1.5 font-mono bg-black/30 px-2 py-1 rounded border border-neutral-800">
                    <span className="text-neutral-500">Cálculo:</span>
                    <strong className="text-neutral-200">{col.formula}</strong>
                  </div>
                )}
              </div>

              {/* Specialist tip */}
              <div className="pt-2.5 border-t border-[#23252b] text-[10.5px] text-neutral-400 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="italic leading-snug">{col.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
