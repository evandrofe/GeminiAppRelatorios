import React from 'react';
import { CampaignRow, CapaData, ReportMeta } from '../types';
import { CapaModelView } from './CapaModelView';

interface SimpleFunctionalPdfReportProps {
  meta: ReportMeta;
  campaigns: CampaignRow[];
  capa: CapaData;
}

export const SimpleFunctionalPdfReport: React.FC<SimpleFunctionalPdfReportProps> = ({
  meta,
  campaigns,
  capa,
}) => {
  const fmtBRL = (v: number) =>
    typeof v === 'number' && v > 0
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
      : '—';

  const fmtNum = (v: number) =>
    typeof v === 'number' && v > 0
      ? new Intl.NumberFormat('pt-BR').format(v)
      : '—';

  const titleCase = (str: string) => {
    if (!str) return '';
    return String(str)
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
  };

  // Consolidação Geral de Métricas
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
  const totalViews = campaigns.reduce((acc, c) => acc + (c.views || 0), 0);
  const totalConv = campaigns.reduce((acc, c) => acc + (c.conv || 0), 0);
  const totalLinks = campaigns.reduce((acc, c) => acc + (c.links || 0), 0);
  const totalEng = campaigns.reduce((acc, c) => acc + (c.eng || 0), 0);

  const avgCostPerConv = totalConv > 0 ? totalSpent / totalConv : 0;
  const avgCPM = totalReach > 0 ? (totalSpent / totalReach) * 1000 : 0;
  const avgCPC = totalLinks > 0 ? totalSpent / totalLinks : 0;
  const avgCostPerView = totalViews > 0 ? totalSpent / totalViews : 0;

  // Verifica se o relatório tem dados de conversas ou vídeos para renderizar colunas extras dinamicamente
  const hasConv = totalConv > 0;
  const hasViews = totalViews > 0;
  const hasLinks = totalLinks > 0;

  return (
    <div className="bg-white text-neutral-900 font-sans print-report-container max-w-[297mm] mx-auto p-4 sm:p-6">
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PÁGINA 1: CAPA OFICIAL (IDENTIDADE VISUAL IDÊNTICA AO MODELO DO CLIENTE) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="print-avoid-break mb-8">
        <CapaModelView meta={meta} capa={capa} isPrint={true} />
      </div>

      {/* Quebra de página para a tabela de ações e custos (Página 2) */}
      <div className="print-page-break my-6" />

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PÁGINA 2: AÇÕES MENSAIS (TABELA OFICIAL FIEL À PÁGINA 2 DO PDF MODELO) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="print-avoid-break space-y-4">
        {/* Barra de Título Laranja Oficial */}
        <div
          className="text-white py-2 px-4 text-center font-black text-sm uppercase tracking-wider rounded-t-sm"
          style={{ backgroundColor: '#FF9900' }}
        >
          AÇÕES MENSAIS
        </div>

        {/* Tabela de Ações e Custos */}
        <div className="overflow-x-auto -mt-4">
          <table className="w-full border-collapse text-[10px] border border-black">
            <thead>
              <tr className="bg-[#E5E7EB] text-black font-black uppercase text-[8.5px] border-b border-black">
                <th className="py-2 px-2 text-center border-r border-black min-w-[160px]">NOME DA AÇÃO</th>
                <th className="py-2 px-1 text-center border-r border-black whitespace-nowrap">FORMATO</th>
                <th className="py-2 px-1 text-center border-r border-black whitespace-nowrap">VALIDADE</th>
                <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">INVESTIMENTO</th>
                <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">VALOR GASTO</th>
                <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">ALCANCE</th>
                {hasConv && <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">CONVERSAS</th>}
                {hasViews && <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">THRUPLAY</th>}
                <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">
                  {hasConv ? 'CUSTO / CONV.' : (hasViews ? 'CUSTO / VÍDEO' : 'CUSTO POR 1.000 PESSOAS')}
                </th>
                <th className="py-2 px-1.5 text-center border-r border-black whitespace-nowrap">FILTRO</th>
                <th className="py-2 px-1.5 text-center whitespace-nowrap">CIDADE</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, idx) => {
                const isAlcanceRow = c.objective === 'Alc' || c.objective === 'ReelsAlc';
                const isDuplicateReach = isAlcanceRow && c.reach > 0 && c.eng === c.reach;

                // Custo chave dependendo do tipo da campanha
                let primaryCost = c.cpm;
                if (c.conv > 0 && c.cConv > 0) primaryCost = c.cConv;
                else if (c.views > 0 && c.cThru > 0) primaryCost = c.cThru;

                return (
                  <tr key={c.id} className="border-b border-black text-black text-center bg-white">
                    <td className="py-1.5 px-2 text-left border-r border-black font-semibold">
                      {titleCase(c.displayName || c.name)}
                    </td>
                    <td className="py-1.5 px-1 border-r border-black whitespace-nowrap">
                      {c.format}
                    </td>
                    <td className="py-1.5 px-1 border-r border-black whitespace-nowrap font-mono text-[9px]">
                      {c.validity || '-'}
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono">
                      {fmtBRL(c.budget)}
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono font-bold">
                      {fmtBRL(c.spent)}
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono font-bold">
                      {fmtNum(c.reach)}
                    </td>
                    {hasConv && (
                      <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono font-bold text-emerald-900">
                        {c.conv > 0 ? c.conv : '-'}
                      </td>
                    )}
                    {hasViews && (
                      <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono text-purple-900 font-bold">
                        {c.views > 0 ? fmtNum(c.views) : '-'}
                      </td>
                    )}
                    <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap font-mono">
                      {primaryCost > 0 ? fmtBRL(primaryCost) : '-'}
                    </td>
                    <td className="py-1.5 px-1.5 border-r border-black whitespace-nowrap text-[9px]">
                      {c.filtro || '-'}
                    </td>
                    <td className="py-1.5 px-1.5 whitespace-nowrap text-[9px]">
                      {c.cidade || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#FEF3C7] text-black font-black border-t border-black text-[10px]">
                <td colSpan={3} className="py-2 px-2 border-r border-black text-left uppercase">
                  Subtotal / Total Geral ({campaigns.length} Ações)
                </td>
                <td className="py-2 px-1.5 border-r border-black text-center font-mono">
                  {fmtBRL(totalBudget)}
                </td>
                <td className="py-2 px-1.5 border-r border-black text-center font-mono font-black">
                  {fmtBRL(totalSpent)}
                </td>
                <td className="py-2 px-1.5 border-r border-black text-center font-mono font-black">
                  {fmtNum(totalReach)}
                </td>
                {hasConv && (
                  <td className="py-2 px-1.5 border-r border-black text-center font-mono font-black text-emerald-950">
                    {totalConv > 0 ? `${totalConv} conv.` : '-'}
                  </td>
                )}
                {hasViews && (
                  <td className="py-2 px-1.5 border-r border-black text-center font-mono font-black text-purple-950">
                    {totalViews > 0 ? fmtNum(totalViews) : '-'}
                  </td>
                )}
                <td className="py-2 px-1.5 border-r border-black text-center font-mono font-bold">
                  {hasConv && avgCostPerConv > 0 ? fmtBRL(avgCostPerConv) : fmtBRL(avgCPM)}
                </td>
                <td className="py-2 px-1.5 border-r border-black text-center font-mono">
                  -
                </td>
                <td className="py-2 px-1.5 text-center font-mono">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RAIO-X DOS RESULTADOS - EXATAMENTE IGUAL À PÁGINA 2 DO MODELO */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="mt-4 print-avoid-break">
          {/* Barra Laranja Raio-X */}
          <div
            className="text-white py-1.5 px-3 text-center font-black text-xs uppercase tracking-wider rounded-t-sm"
            style={{ backgroundColor: '#FF9900' }}
          >
            RAIO-X DOS RESULTADOS - ENTENDA O QUE CADA INDICADOR MOSTRA
          </div>

          {/* Caixa de Texto das Legendas */}
          <div className="border border-black border-t-0 p-3 bg-white text-[9.5px] text-neutral-900 leading-relaxed space-y-1.5">
            <p>
              <strong className="text-black font-bold">Alcance:</strong> É o número de contas que a postagem alcançou. Ou seja, a quantidade de contas que receberam o post.
            </p>
            <p>
              <strong className="text-black font-bold">Engajamento:</strong> É o número de vezes que houve interação com a postagem de pessoas com maior probabilidade de interesse no produto ofertado. A plataforma analisa os perfis de pessoas que estejam procurando os produtos ofertados, e faz a entrega para estes perfis (sem filtro). Ou seja, a soma da quantidade de vezes que o post foi aberto, curtido, compartilhado, comentado por um público mais engajado.
            </p>
            <p>
              <strong className="text-black font-bold">Conversas iniciadas:</strong> Quantidade de conversas iniciadas no WhatsApp a partir do anúncio.
            </p>
            <p>
              <strong className="text-black font-bold">Visualização (ThruPlay):</strong> Número de vezes que o vídeo foi assistido por pelo menos 15 segundos ou até o fim, quando menor que esse tempo.
            </p>
            <p>
              <strong className="text-black font-bold">Cliques no link:</strong> Quantidade de cliques em links do anúncio para destinos externos, como site ou WhatsApp.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* NOTA DE RODAPÉ / AVISO OFICIAL SOBRE O LEILÃO DA META */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border border-black p-3 bg-white text-[9px] text-neutral-800 leading-relaxed italic print-avoid-break">
          *Algumas colunas podem não ser preenchidas, pois variam de acordo com o tipo de impulsionamento e com as métricas disponíveis em cada campanha. Além disso, em alguns casos, a plataforma pode não utilizar toda a verba prevista, seja por limitação de público, concorrência no leilão de anúncios, baixo engajamento ou instabilidades na entrega. Por isso, o valor efetivamente considerado como consumido é o da coluna "Valor gasto".
        </div>
      </div>
    </div>
  );
};
