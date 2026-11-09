import React from 'react';
import { CapaData, ReportMeta } from '../types';

interface CapaModelViewProps {
  meta: ReportMeta;
  capa: CapaData;
  className?: string;
  isPrint?: boolean;
}

// Ícones de silhuetas humanas fiéis ao modelo do PDF
const MaleSilhouette: React.FC<{ filled?: boolean }> = ({ filled = true }) => (
  <svg
    viewBox="0 0 24 32"
    className={`w-4 h-7 ${filled ? 'fill-neutral-950' : 'fill-none stroke-neutral-950 stroke-[1.8]'}`}
  >
    <circle cx="12" cy="4.5" r="3.5" />
    <path d="M6 10.5C6 9.7 6.7 9 7.5 9H16.5C17.3 9 18 9.7 18 10.5V17H15.5V29C15.5 29.8 14.8 30.5 14 30.5H13C12.2 30.5 11.5 29.8 11.5 29V20H12.5V20H12.5V29C12.5 29.8 11.8 30.5 11 30.5H10C9.2 30.5 8.5 29.8 8.5 29V17H6V10.5Z" />
  </svg>
);

const FemaleSilhouette: React.FC<{ filled?: boolean }> = ({ filled = true }) => (
  <svg
    viewBox="0 0 24 32"
    className={`w-4 h-7 ${filled ? 'fill-neutral-950' : 'fill-none stroke-neutral-950 stroke-[1.8]'}`}
  >
    <circle cx="12" cy="4.5" r="3.5" />
    <path d="M7 10C7 9.4 7.4 9 8 9H16C16.6 9 17 9.4 17 10L18.8 19H14.5V29C14.5 29.8 13.8 30.5 13 30.5H12.2C11.4 30.5 10.7 29.8 10.7 29V21H13.3V21H10.7V29C10.7 29.8 10 30.5 9.2 30.5H8.5C7.7 30.5 7 29.8 7 29V19H5.2L7 10Z" />
  </svg>
);

// Ícone de Linha 1: Gráfico com tendência de Faixa Etária
const ChartAgeIcon: React.FC = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10 stroke-neutral-950 fill-none stroke-[2] mx-auto">
    <path d="M6 34H34" strokeLinecap="round" />
    <rect x="9" y="22" width="5" height="12" rx="1" />
    <rect x="17" y="16" width="5" height="18" rx="1" />
    <rect x="25" y="10" width="5" height="24" rx="1" />
    <path d="M10 16L18 10L24 13L32 6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="6" r="2" fill="currentColor" className="fill-neutral-950" />
  </svg>
);

// Ícone de Linha 2: Megafone / Contas Alcançadas
const MegaphoneReachIcon: React.FC = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10 stroke-neutral-950 fill-none stroke-[2] mx-auto">
    <path d="M8 16H13L24 9V29L13 22H8C6.9 22 6 21.1 6 20V18C6 16.9 6.9 16 8 16Z" strokeLinejoin="round" />
    <path d="M13 22V28C13 29.1 13.9 30 15 30H17C18.1 30 19 29.1 19 28V26" strokeLinecap="round" />
    <path d="M28 15C29.5 16.5 30.5 18.2 30.5 20C30.5 21.8 29.5 23.5 28 25" strokeLinecap="round" />
    <path d="M32 12C34.5 14.5 35.5 17.2 35.5 20C35.5 22.8 34.5 25.5 32 28" strokeLinecap="round" />
  </svg>
);

// Ícone de Linha 3: Alvo / Visitas
const TargetVisitsIcon: React.FC = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10 stroke-neutral-950 fill-none stroke-[2] mx-auto">
    <circle cx="20" cy="20" r="13" />
    <circle cx="20" cy="20" r="7" />
    <circle cx="20" cy="20" r="2" fill="currentColor" className="fill-neutral-950" />
    <line x1="20" y1="3" x2="20" y2="7" strokeLinecap="round" />
    <line x1="20" y1="33" x2="20" y2="37" strokeLinecap="round" />
    <line x1="3" y1="20" x2="7" y2="20" strokeLinecap="round" />
    <line x1="33" y1="20" x2="37" y2="20" strokeLinecap="round" />
  </svg>
);

export const CapaModelView: React.FC<CapaModelViewProps> = ({
  meta,
  capa,
  className = '',
  isPrint = false,
}) => {
  const pct = (v: string) => {
    const s = String(v || '').trim();
    return s ? (s.endsWith('%') ? s : `${s}%`) : '—';
  };

  const mesAnoStr = `${(meta.mes || 'MÊS').toUpperCase()} - ${meta.ano || 'ANO'}`;

  return (
    <div
      className={`bg-[#FBBC04] text-neutral-950 font-sans rounded-2xl p-6 sm:p-10 shadow-xl border-2 border-amber-600/30 relative overflow-hidden flex flex-col justify-between ${
        isPrint ? 'min-h-[175mm] p-8 print-avoid-break' : 'min-h-[520px]'
      } ${className}`}
      style={{ backgroundColor: '#FBBC04' }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CABEÇALHO DA CAPA (IDENTIFICAÇÃO PRINCIPAL) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="text-center pt-1 pb-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-950 leading-tight">
          RELATÓRIO DE TRÁFEGO PAGO
        </h1>
        <p className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-wider mt-1 uppercase">
          MÊS DE {mesAnoStr}
          {meta.cliente && (
            <span className="block text-xs sm:text-sm font-bold text-neutral-800 tracking-normal mt-0.5 normal-case">
              {meta.cliente}
            </span>
          )}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CORPO CENTRAL: 2 COLUNAS (FACEBOOK À ESQUERDA, INSTAGRAM À DIREITA) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto py-2">
        {/* ===================== COLUNA FACEBOOK ===================== */}
        <div className="flex flex-col items-center text-center">
          {/* Badge Facebook (Cápsula Branca com 'f' preto e texto) */}
          <div className="bg-white rounded-full px-5 py-1.5 shadow-md flex items-center gap-2 mb-4 border border-black/10">
            <div className="w-5 h-5 rounded-full bg-neutral-950 text-white flex items-center justify-center font-bold text-xs leading-none">
              f
            </div>
            <span className="font-extrabold text-sm text-neutral-950 tracking-tight">Facebook</span>
          </div>

          {/* Seguidores */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              {capa.fb.seguidores || '—'}{' '}
              <span className="font-medium text-lg sm:text-xl">Total de seguidores</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-900 font-bold mt-0.5">
              {capa.fb.segAnterior || '—'} seguidores no mês anterior
            </p>
          </div>

          {/* Silhuetas de Gênero */}
          <div className="space-y-2 mb-6 w-full max-w-[280px]">
            {/* Homens */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={false} />
              </div>
              <span className="text-base sm:text-lg font-black text-neutral-950 min-w-[130px] text-left">
                {pct(capa.fb.homens)} Homens
              </span>
            </div>

            {/* Mulheres */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={false} />
              </div>
              <span className="text-base sm:text-lg font-black text-neutral-950 min-w-[130px] text-left">
                {pct(capa.fb.mulheres)} Mulheres
              </span>
            </div>
          </div>

          {/* 3 Métricas Inferiores com Ícones de Linha */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[340px] pt-2 border-t border-black/15">
            {/* Faixa Etária */}
            <div className="flex flex-col items-center">
              <ChartAgeIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.fb.faixa || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                FAIXA ETÁRIA
              </span>
            </div>

            {/* Contas Alcançadas */}
            <div className="flex flex-col items-center">
              <MegaphoneReachIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.fb.alcancadas || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                CONTAS ALCANÇADAS
              </span>
            </div>

            {/* Visitas à Página */}
            <div className="flex flex-col items-center">
              <TargetVisitsIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.fb.visitas || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                VISITAS À PÁGINA
              </span>
            </div>
          </div>
        </div>

        {/* ===================== COLUNA INSTAGRAM ===================== */}
        <div className="flex flex-col items-center text-center">
          {/* Badge Instagram (Cápsula Branca com câmera preta e texto) */}
          <div className="bg-white rounded-full px-5 py-1.5 shadow-md flex items-center gap-2 mb-4 border border-black/10">
            <div className="w-5 h-5 rounded-md bg-neutral-950 text-white flex items-center justify-center font-bold text-xs leading-none">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="font-extrabold text-sm text-neutral-950 tracking-tight">Instagram</span>
          </div>

          {/* Seguidores */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              {capa.ig.seguidores || '—'}{' '}
              <span className="font-medium text-lg sm:text-xl">Total de seguidores</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-900 font-bold mt-0.5">
              {capa.ig.segAnterior || '—'} seguidores no mês anterior
            </p>
          </div>

          {/* Silhuetas de Gênero */}
          <div className="space-y-2 mb-6 w-full max-w-[280px]">
            {/* Homens */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={true} />
                <MaleSilhouette filled={false} />
              </div>
              <span className="text-base sm:text-lg font-black text-neutral-950 min-w-[130px] text-left">
                {pct(capa.ig.homens)} Homens
              </span>
            </div>

            {/* Mulheres */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1">
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={true} />
                <FemaleSilhouette filled={false} />
              </div>
              <span className="text-base sm:text-lg font-black text-neutral-950 min-w-[130px] text-left">
                {pct(capa.ig.mulheres)} Mulheres
              </span>
            </div>
          </div>

          {/* 3 Métricas Inferiores com Ícones de Linha */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[340px] pt-2 border-t border-black/15">
            {/* Faixa Etária */}
            <div className="flex flex-col items-center">
              <ChartAgeIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.ig.faixa || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                FAIXA ETÁRIA
              </span>
            </div>

            {/* Contas Alcançadas */}
            <div className="flex flex-col items-center">
              <MegaphoneReachIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.ig.alcancadas || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                CONTAS ALCANÇADAS
              </span>
            </div>

            {/* Visitas ao Perfil */}
            <div className="flex flex-col items-center">
              <TargetVisitsIcon />
              <strong className="text-base sm:text-lg font-black text-neutral-950 mt-1 leading-tight">
                {capa.ig.visitas || '—'}
              </strong>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight text-neutral-900 mt-0.5 leading-tight">
                VISITAS À PÁGINA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* RODAPÉ INSTITUCIONAL (MARCA CREATIVE COMUNICAÇÃO) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="pt-4 border-t border-black/15 flex items-center justify-center">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-neutral-950/20 bg-white/30 backdrop-blur-xs">
          <span className="font-extrabold text-xs tracking-tight text-neutral-950">
            creative
          </span>
          <span className="text-[9px] font-semibold tracking-wider uppercase text-neutral-800">
            comunicação
          </span>
        </div>
      </div>
    </div>
  );
};
