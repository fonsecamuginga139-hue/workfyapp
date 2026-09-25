import React from 'react';
import { StorageService } from '../services/storage';
import { Biosite } from '../types';
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  MapPin,
  Calendar,
  Phone,
  ShoppingBag,
  Clock,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';

interface AnalyticsViewProps {
  biositeId: string;
  onNavigate: (route: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ biositeId, onNavigate }) => {
  const biosite = StorageService.getBiositeById(biositeId);
  const [remote, setRemote] = React.useState<Biosite['analytics'] | null>(null);
  React.useEffect(() => {
    StorageService.fetchAnalytics(biositeId).then(setRemote);
  }, [biositeId]);

  if (!biosite) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] p-8 text-center">
        <p className="text-xs text-[#667085]">Biosite não encontrado.</p>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="mt-3 text-xs font-bold text-[#155EEF]"
        >
          Voltar para o Painel
        </button>
      </div>
    );
  }

  const analytics = remote || {
    views: 0,
    whatsappClicks: 0,
    callClicks: 0,
    locationClicks: 0,
    appointmentClicks: 0,
    productClicks: 0,
    recentEvents: [],
  };

  const totalInteractions =
    analytics.whatsappClicks +
    analytics.callClicks +
    analytics.locationClicks +
    analytics.appointmentClicks +
    analytics.productClicks;

  const conversionRate =
    analytics.views > 0 ? ((totalInteractions / analytics.views) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#101828]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#EEF3F8] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Painel</span>
            </button>
            <div className="h-4 w-[1px] bg-[#EEF3F8]" />
            <div>
              <h2 className="text-sm font-bold text-[#0B1F3A] truncate max-w-[200px]">
                {biosite.name}
              </h2>
              <span className="text-[11px] text-[#667085]">Analytics & Métricas</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/dashboard/biosites/${biosite.id}/editor`)}
              className="rounded-xl border border-[#EEF3F8] bg-white px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-[#F7F9FC]"
            >
              Editar Biosite
            </button>
            <a
              href={`${window.location.origin}/b/${biosite.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-[#155EEF] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Página
            </a>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-[#0B1F3A] tracking-tight">
            Visão Geral de Desempenho
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Acompanhe o interesse e as conversões geradas pelo seu biosite.
          </p>
        </div>

        {/* 4 PRIMARY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#667085] mb-3">
              <span className="text-xs font-semibold">Visualizações</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#155EEF]">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0B1F3A]">{analytics.views}</p>
            <p className="text-[11px] text-[#667085] mt-1">Acessos à página pública</p>
          </div>

          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#667085] mb-3">
              <span className="text-xs font-semibold">Cliques WhatsApp</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0B1F3A]">{analytics.whatsappClicks}</p>
            <p className="text-[11px] text-[#667085] mt-1">Contatos diretos iniciados</p>
          </div>

          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#667085] mb-3">
              <span className="text-xs font-semibold">Localização & Rota</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0B1F3A]">{analytics.locationClicks}</p>
            <p className="text-[11px] text-[#667085] mt-1">Cliques em Como Chegar</p>
          </div>

          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-[#667085] mb-3">
              <span className="text-xs font-semibold">Agendamentos</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0B1F3A]">{analytics.appointmentClicks}</p>
            <p className="text-[11px] text-[#667085] mt-1">Tentativas de agendamento</p>
          </div>
        </div>

        {/* SECONDARY STATS & CONVERSION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] mb-2">
              <ShoppingBag className="h-4 w-4 text-[#155EEF]" />
              Interesse em Produtos
            </div>
            <p className="text-xl font-bold text-[#0B1F3A]">{analytics.productClicks} cliques</p>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              Cliques em botões de pedido ou informações em produtos individuais.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] mb-2">
              <Phone className="h-4 w-4 text-[#155EEF]" />
              Chamadas Telefônicas
            </div>
            <p className="text-xl font-bold text-[#0B1F3A]">{analytics.callClicks} ligações</p>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              Clientes que clicaram no botão para discar diretamente.
            </p>
          </div>

          <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B1F3A] mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Taxa de Conversão Estimada
            </div>
            <p className="text-xl font-bold text-emerald-600">{conversionRate}%</p>
            <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
              Percentual de visitantes que realizaram pelo menos uma ação de contato.
            </p>
          </div>
        </div>

        {/* RECENT EVENTS TIMELINE */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-[#0B1F3A] mb-1">Últimas Interações</h3>
          <p className="text-xs text-[#667085] mb-4">
            Registro cronológico das ações recentes executadas pelos visitantes.
          </p>

          {(!analytics.recentEvents || analytics.recentEvents.length === 0) ? (
            <div className="rounded-xl border border-dashed border-[#EEF3F8] p-6 text-center text-xs text-[#667085]">
              Nenhuma interação registrada recentemente.
            </div>
          ) : (
            <div className="divide-y divide-[#EEF3F8]">
              {analytics.recentEvents.map((ev) => (
                <div key={ev.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        ev.type === 'whatsapp'
                          ? 'bg-emerald-500'
                          : ev.type === 'location'
                          ? 'bg-amber-500'
                          : ev.type === 'product'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-semibold text-[#0B1F3A] capitalize">
                      {ev.type === 'whatsapp'
                        ? 'WhatsApp'
                        : ev.type === 'location'
                        ? 'Localização'
                        : ev.type === 'product'
                        ? 'Produto'
                        : ev.type === 'call'
                        ? 'Ligação'
                        : 'Visualização'}
                    </span>
                    {ev.label && <span className="text-[#667085]">({ev.label})</span>}
                  </div>
                  <span className="text-[11px] text-[#667085] flex items-center gap-1">
                    <Clock className="h-3 w-3 inline" />
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
