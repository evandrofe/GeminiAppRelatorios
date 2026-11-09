import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { StepUpload } from './components/StepUpload';
import { StepReview } from './components/StepReview';
import { StepCapa } from './components/StepCapa';
import { StepReport } from './components/StepReport';
import { StepConfig } from './components/StepConfig';
import {
  CampaignRow,
  CapaData,
  ClassifierConfig,
  ObjectiveType,
  ReportMeta
} from './types';
import {
  DEFAULT_CLASSIFIER_CONFIG,
  getSampleDemoData,
  parseExcelWorkbook,
  parseFileName,
  sortCampaignRows
} from './lib/metaAdsParser';
import { exportToExcel } from './lib/excelExport';
import { SimpleFunctionalPdfReport } from './components/SimpleFunctionalPdfReport';

const STORAGE_KEY = 'relatorio_ads_gemini_state_v1';
const CONFIG_STORAGE_KEY = 'relatorio_ads_gemini_config_v1';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [meta, setMeta] = useState<ReportMeta | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [capa, setCapa] = useState<CapaData>({
    fb: { seguidores: '', segAnterior: '', homens: '', mulheres: '', faixa: '', alcancadas: '', visitas: '' },
    ig: { seguidores: '', segAnterior: '', homens: '', mulheres: '', faixa: '', alcancadas: '', visitas: '' }
  });
  const [config, setConfig] = useState<ClassifierConfig>(() => {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CLASSIFIER_CONFIG;
    } catch {
      return DEFAULT_CLASSIFIER_CONFIG;
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'client' || window.location.hash.includes('client');
    }
    return false;
  });

  // Restore saved state from local storage or initialize demo on client mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.campaigns && parsed.campaigns.length > 0) {
          setMeta(parsed.meta || null);
          setCampaigns(parsed.campaigns || []);
          if (parsed.capa) setCapa(parsed.capa);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
        }
      } else if (isPresentationMode) {
        // Automatically provide rich demo dataset if shared directly
        const sample = getSampleDemoData();
        setMeta(sample.meta);
        setCampaigns(sample.rows);
        setCapa(sample.capa);
        setCurrentStep(4);
      }
    } catch (e) {
      console.warn('Erro ao restaurar dados salvos no navegador:', e);
    }
  }, [isPresentationMode]);

  // Save state on changes
  useEffect(() => {
    if (campaigns.length > 0 && meta) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            meta,
            campaigns,
            capa,
            currentStep
          })
        );
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }
  }, [meta, campaigns, capa, currentStep]);

  // Handle uploading and parsing of an .xlsx/.xls file
  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) throw new Error('Não foi possível ler o arquivo.');

        const wb = XLSX.read(buffer, { type: 'array', cellDates: true, dateNF: 'dd/mm/yyyy' });
        const data = parseExcelWorkbook(wb);
        if (!data || data.length === 0) {
          throw new Error('Nenhuma campanha identificada no arquivo.');
        }

        const parsedMeta = parseFileName(file.name);
        setMeta(parsedMeta);
        setCampaigns(data);
        setCurrentStep(2);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(
          err.message || 'Erro ao processar o arquivo. Verifique se é uma exportação válida do Meta Ads.'
        );
      }
    };

    reader.onerror = () => {
      setErrorMessage('Erro de leitura do arquivo no navegador.');
    };

    reader.readAsArrayBuffer(file);
  };

  // Load complete pre-configured demonstration
  const handleLoadDemo = () => {
    const demo = getSampleDemoData();
    setMeta(demo.meta);
    setCampaigns(demo.rows);
    setCapa(demo.capa);
    setCurrentStep(2);
    setErrorMessage(null);
  };

  // Clear state and start fresh
  const handleReset = () => {
    setMeta(null);
    setCampaigns([]);
    setCapa({
      fb: { seguidores: '', segAnterior: '', homens: '', mulheres: '', faixa: '', alcancadas: '', visitas: '' },
      ig: { seguidores: '', segAnterior: '', homens: '', mulheres: '', faixa: '', alcancadas: '', visitas: '' }
    });
    setCurrentStep(1);
    setErrorMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Update objective for a specific campaign
  const handleUpdateObjective = (campaignId: string, newObjective: ObjectiveType) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, objective: newObjective } : c))
    );
  };

  // Update display name for a specific campaign
  const handleUpdateDisplayName = (campaignId: string, newDisplayName: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, displayName: newDisplayName } : c))
    );
  };

  // Update format for a specific campaign
  const handleUpdateFormat = (campaignId: string, newFormat: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, format: newFormat } : c))
    );
  };

  // Update filtro for a specific campaign
  const handleUpdateFiltro = (campaignId: string, newFiltro: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, filtro: newFiltro } : c))
    );
  };

  // Update cidade for a specific campaign
  const handleUpdateCidade = (campaignId: string, newCidade: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, cidade: newCidade } : c))
    );
  };

  // Batch update filtro and cidade for all campaigns
  const handleBatchUpdateFiltroCidade = (filtro: string, cidade: string) => {
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        ...(filtro !== undefined && filtro !== '' ? { filtro } : {}),
        ...(cidade !== undefined && cidade !== '' ? { cidade } : {})
      }))
    );
  };

  // Batch AI classification with Gemini
  const handleAiClassify = async () => {
    if (!campaigns.length) return;
    setIsAiClassifying(true);

    try {
      const res = await fetch('/api/gemini/classify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaigns }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao classificar com Gemini.');
      }

      const classifications: Array<{
        id: string;
        objective: ObjectiveType;
        format: string;
        displayName: string;
        reason: string;
        confidence: 'high' | 'medium' | 'low';
      }> = data.classifications || [];

      // Map back to campaigns
      setCampaigns((prev) => {
        const next = prev.map((camp) => {
          const match = classifications.find((c) => c.id === camp.id);
          if (match) {
            return {
              ...camp,
              objective: match.objective,
              format: match.format || camp.format,
              displayName: match.displayName || camp.displayName,
              aiNotes: `IA: ${match.reason}`,
              confidence: match.confidence,
            };
          }
          return camp;
        });
        sortCampaignRows(next);
        return next;
      });
    } catch (err: any) {
      alert('Erro na classificação inteligente: ' + err.message);
    } finally {
      setIsAiClassifying(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    if (!campaigns.length || !meta) return;
    setIsExportingExcel(true);
    try {
      await exportToExcel(meta, campaigns, capa);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao exportar planilha Excel: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Save classifier config
  const handleSaveConfig = (newConfig: ClassifierConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {}
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CLASSIFIER_CONFIG);
    try {
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {!isPresentationMode && (
        <Header
          currentStep={currentStep}
          onSelectStep={setCurrentStep}
          meta={meta}
          hasData={campaigns.length > 0}
          onExportExcel={handleExportExcel}
          isExportingExcel={isExportingExcel}
          onReset={handleReset}
          onLoadDemo={handleLoadDemo}
        />
      )}

      {isPresentationMode && (
        <div className="bg-[#121316] border-b border-[#2b2d33] px-6 py-2.5 flex items-center justify-between text-xs text-neutral-400 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">Modo Apresentação do Cliente Ativo</span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="hidden sm:inline">Exibindo relatório interativo de {meta?.cliente || 'Cliente'}</span>
          </div>
          <button
            onClick={() => setIsPresentationMode(false)}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Sair do Modo Apresentação (Voltar ao Editor)
          </button>
        </div>
      )}

      <main className="flex-1 pb-16">
        {(!isPresentationMode && currentStep === 1) && (
          <StepUpload
            onFileUpload={handleFileUpload}
            onLoadDemo={handleLoadDemo}
            errorMessage={errorMessage}
            onClearError={() => setErrorMessage(null)}
          />
        )}

        {(!isPresentationMode && currentStep === 2 && meta) && (
          <StepReview
            meta={meta}
            campaigns={campaigns}
            onUpdateObjective={handleUpdateObjective}
            onUpdateDisplayName={handleUpdateDisplayName}
            onUpdateFormat={handleUpdateFormat}
            onUpdateFiltro={handleUpdateFiltro}
            onUpdateCidade={handleUpdateCidade}
            onBatchUpdateFiltroCidade={handleBatchUpdateFiltroCidade}
            onAiClassify={handleAiClassify}
            isAiClassifying={isAiClassifying}
            onContinue={() => setCurrentStep(3)}
          />
        )}

        {(!isPresentationMode && currentStep === 3 && meta) && (
          <StepCapa
            meta={meta}
            capa={capa}
            onChangeCapa={setCapa}
            onBack={() => setCurrentStep(2)}
            onContinue={() => setCurrentStep(4)}
          />
        )}

        {(isPresentationMode || (currentStep === 4 && meta)) && meta && (
          <StepReport
            meta={meta}
            campaigns={campaigns}
            capa={capa}
            onExportExcel={handleExportExcel}
            isExportingExcel={isExportingExcel}
            onBackToCapa={() => setCurrentStep(3)}
            onUpdateFiltro={handleUpdateFiltro}
            onUpdateCidade={handleUpdateCidade}
            onBatchUpdateFiltroCidade={handleBatchUpdateFiltroCidade}
            isPresentationMode={isPresentationMode}
            onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
          />
        )}

        {(!isPresentationMode && currentStep === 5) && (
          <StepConfig
            config={config}
            onSaveConfig={handleSaveConfig}
            onResetConfig={handleResetConfig}
          />
        )}

        {/* Impressão Global do PDF Simples e Funcional */}
        {(meta && campaigns.length > 0 && currentStep !== 4 && !isPresentationMode) && (
          <div className="print-only">
            <SimpleFunctionalPdfReport
              meta={meta}
              campaigns={campaigns}
              capa={capa}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-[#1e2025] py-6 px-4 text-center text-xs text-neutral-500 bg-[#090a0c]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Relatório de Impulsionamento Meta Ads & Gemini AI • Tecnologia de análise corporativa e automação
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Versão 2.0 Gemini Edition</span>
            <span>•</span>
            <button
              onClick={() => setCurrentStep(5)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Configurar Regras
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
