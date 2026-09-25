import React, { useState } from 'react';
import { Biosite } from '../types';
import { formatKz, generateWhatsAppLink } from '../services/storage';
import { openExternalUrl } from '../utils/browser';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Send,
  Building,
  BarChart2,
  Award,
} from 'lucide-react';

interface SalesDashboardProps {
  userBiosites: Biosite[];
  onRefresh: () => void;
  onNavigate: (route: string) => void;
  onOpenManager: () => void;
}

export const SalesDashboard: React.FC<SalesDashboardProps> = ({
  userBiosites,
  onRefresh,
  onNavigate,
  onOpenManager,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'sold' | 'for_sale'>('all');

  // Calculations based strictly on user's configuration
  const totalBiosites = userBiosites.length;
  const soldBiosites = userBiosites.filter((b) => b.saleStatus === 'sold');
  const forSaleBiosites = userBiosites.filter(
    (b) => !b.saleStatus || b.saleStatus === 'available' || b.saleStatus === 'negotiating'
  );
  
  const totalRevenue = soldBiosites.reduce((acc, b) => acc + (b.soldPrice || b.salePrice || 0), 0);
  const potentialRevenue = forSaleBiosites.reduce((acc, b) => acc + (b.salePrice || 120000), 0);
  const averageTicket = soldBiosites.length > 0 ? Math.round(totalRevenue / soldBiosites.length) : 0;

  const filteredBiosites = userBiosites.filter((b) => {
    if (filterStatus === 'sold') return b.saleStatus === 'sold';
    if (filterStatus === 'for_sale') return !b.saleStatus || b.saleStatus === 'available' || b.saleStatus === 'negotiating';
    return true;
  });

  const handleFollowUp = (b: Biosite) => {
    const clientName = b.clientName || 'Cliente';
    const bizName = b.name;
    const url = `${window.location.origin}/b/${b.slug}`;
    const message = `Olá *${clientName}*! Aqui é da Workfy. Passando para verificar como está o seu biosite da *${bizName}* e se precisa de algum ajuste ou suporte com o seu link profissional: ${url}`;
    const phone = b.clientPhone || '+244';
    const link = generateWhatsAppLink(phone, message);
    openExternalUrl(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & METRICS SUMMARY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EEF3F8]">
        <div>
          <h1 className="text-xl font-extrabold text-[#0B1F3A] tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <span>Painel de Vendas & Faturamento</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Valores configurados por você para cada biosite, com acompanhamento de vendas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenManager}
            className="flex items-center gap-1.5 rounded-xl border border-[#EEF3F8] bg-white px-3.5 py-2 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-all cursor-pointer shadow-2xs"
          >
            <ShoppingBag className="h-4 w-4 text-[#155EEF]" />
            <span>Gerenciar Status de Venda</span>
          </button>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL FATURADO */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Total Faturado (Vendas)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950">
              {formatKz(totalRevenue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{soldBiosites.length} biosites vendidos e quitados</span>
          </div>
        </div>

        {/* POTENCIAL EM NEGOCIAÇÃO */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
              Potencial à Venda
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#155EEF]/10 text-[#155EEF]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B1F3A]">
              {formatKz(potentialRevenue)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#667085]">
            <Clock className="h-3.5 w-3.5 text-[#155EEF]" />
            <span>{forSaleBiosites.length} biosites disponíveis no catálogo</span>
          </div>
        </div>

        {/* TICKET MÉDIO */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
              Ticket Médio por Venda
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B1F3A]">
              {formatKz(averageTicket)}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#667085]">
            Média de preço configurada nas vendas
          </div>
        </div>

        {/* TOTAL DE BIOSITES */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
              Total Criados
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B1F3A]">
              {totalBiosites}
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              ({soldBiosites.length} vendidos)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-semibold text-[#667085]">
            Portfólio completo na plataforma
          </div>
        </div>
      </div>

      {/* SALES CHART BASED ON CONFIGURED VALUES */}
      <div className="rounded-2xl border border-[#EEF3F8] bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B1F3A] flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#155EEF]" />
              <span>Gráfico de Desempenho de Vendas e Faturamento</span>
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Valores reais configurados por biosite e somados por categoria de negócio.
            </p>
          </div>
        </div>

        {/* VISUAL BAR CHART BY BIOSITE / CATEGORY */}
        {userBiosites.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#667085]">
            Nenhum biosite cadastrado para exibir no gráfico.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBiosites.map((b) => {
                const isSold = b.saleStatus === 'sold';
                const price = isSold ? (b.soldPrice || b.salePrice || 0) : (b.salePrice || 120000);
                const maxPrice = Math.max(...userBiosites.map(x => x.soldPrice || x.salePrice || 120000), 150000);
                const percentage = Math.min(Math.round((price / maxPrice) * 100), 100);

                return (
                  <div key={b.id} className="rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#667085] uppercase truncate">
                          {b.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isSold ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#155EEF]'
                        }`}>
                          {isSold ? 'VENDIDO' : 'À VENDA'}
                        </span>
                      </div>
                      <h4 className="mt-2 text-xs font-black text-[#0B1F3A] truncate">
                        {b.name}
                      </h4>
                      <p className="mt-1 text-xs font-extrabold text-emerald-700">
                        {formatKz(price)}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-[#667085] mb-1">
                        <span>Peso no Portfólio</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isSold ? 'bg-emerald-600' : 'bg-[#155EEF]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED TABLE OF BIOSITES & CONFIGURED PRICES */}
      <div className="rounded-2xl border border-[#EEF3F8] bg-white shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#EEF3F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B1F3A]">
              Tabela de Biosites & Preços Configurados
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Visualize quem comprou, quanto pagou e faça follow-up via WhatsApp.
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-1.5 bg-[#F7F9FC] p-1 rounded-xl border border-[#EEF3F8]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#667085]'
              }`}
            >
              Todos ({userBiosites.length})
            </button>
            <button
              onClick={() => setFilterStatus('sold')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'sold' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#667085]'
              }`}
            >
              Vendidos ({soldBiosites.length})
            </button>
            <button
              onClick={() => setFilterStatus('for_sale')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'for_sale' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#667085]'
              }`}
            >
              À Venda ({forSaleBiosites.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEF3F8] bg-[#F7F9FC] text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                <th className="py-3 px-4">Biosite / Negócio</th>
                <th className="py-3 px-4">Status de Venda</th>
                <th className="py-3 px-4">Cliente / Comprador</th>
                <th className="py-3 px-4">Preço / Valor Pago</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F8] text-xs">
              {filteredBiosites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#667085]">
                    Nenhum biosite encontrado com este filtro.
                  </td>
                </tr>
              ) : (
                filteredBiosites.map((b) => {
                  const isSold = b.saleStatus === 'sold';
                  const price = isSold ? (b.soldPrice || b.salePrice || 0) : (b.salePrice || 120000);

                  return (
                    <tr key={b.id} className="hover:bg-[#F7F9FC]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {b.logoUrl ? (
                            <img
                              src={b.logoUrl}
                              alt={b.name}
                              className="h-9 w-9 rounded-lg object-cover border border-[#EEF3F8]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#155EEF] text-white font-black text-xs">
                              {b.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-[#0B1F3A] block">{b.name}</span>
                            <span className="text-[11px] text-[#667085]">/b/{b.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          isSold ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-[#155EEF]'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isSold ? 'bg-emerald-600' : 'bg-[#155EEF]'}`} />
                          {isSold ? 'Vendido' : 'Disponível à Venda'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-[#0B1F3A]">
                        {isSold ? (
                          <div>
                            <span>{b.clientName || 'Cliente não informado'}</span>
                            {b.clientPhone && (
                              <span className="block text-[11px] text-[#667085]">{b.clientPhone}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#667085] italic">Sem comprador ainda</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700">
                        {formatKz(price)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSold && b.clientPhone && (
                            <button
                              onClick={() => handleFollowUp(b)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer"
                              title="Fazer Follow-up via WhatsApp"
                            >
                              <Send className="h-3 w-3" />
                              <span>Follow-up</span>
                            </button>
                          )}
                          <button
                            onClick={() => onNavigate(`/dashboard/biosites/${b.id}/editor`)}
                            className="flex items-center gap-1 rounded-lg border border-[#EEF3F8] bg-white px-3 py-1.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-all cursor-pointer"
                          >
                            <span>Editar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
