import React, { useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { Biosite } from '../types';
import { StorageService } from '../services/storage';

type Props = { inbox: { leads: any[]; bookings: any[] }; biosites: Biosite[]; onReload: () => void };

const LEAD_STATUS = [
  { id: 'new', label: 'Novo' },
  { id: 'contacted', label: 'Contactado' },
  { id: 'closed', label: 'Fechado' },
] as const;
const BOOKING_STATUS = [
  { id: 'pending', label: 'Pendente' },
  { id: 'confirmed', label: 'Confirmada' },
  { id: 'completed', label: 'Concluída' },
  { id: 'cancelled', label: 'Cancelada' },
] as const;

const waLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' });

export function InboxPanel({ inbox, biosites, onReload }: Props) {
  const [view, setView] = useState<'leads' | 'bookings'>('leads');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const siteName = (id: string) => biosites.find((b) => b.id === id)?.name || 'Biosite';

  const rows = useMemo(() => {
    const list = view === 'leads' ? inbox.leads : inbox.bookings;
    const term = q.trim().toLowerCase();
    return list.filter((r) => (status === 'all' || r.status === status) &&
      (!term || [r.name, r.customer_name, r.phone, r.customer_phone, r.email, r.message].some((v) => String(v || '').toLowerCase().includes(term))));
  }, [view, inbox, q, status]);

  const change = async (id: string, value: string) => {
    setError(null);
    try {
      if (view === 'leads') await StorageService.setLeadStatus(id, value as any);
      else await StorageService.setBookingStatus(id, value as any);
      onReload();
    } catch { setError('Não foi possível atualizar o estado.'); }
  };

  const statuses = view === 'leads' ? LEAD_STATUS : BOOKING_STATUS;

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-black text-[#0B1F3A] tracking-tight">Leads e reservas</h1>
        <p className="text-xs text-[#667085] mt-0.5">Pedidos enviados pelos visitantes dos seus biosites.</p>
      </div>

      <div className="inline-flex rounded-xl border border-[#EEF3F8] bg-white p-1 text-xs font-bold">
        {(['leads', 'bookings'] as const).map((v) => (
          <button key={v} onClick={() => { setView(v); setStatus('all'); }}
            className={`rounded-lg px-3 py-1.5 ${view === v ? 'bg-[#155EEF] text-white' : 'text-[#667085]'}`}>
            {v === 'leads' ? `Leads (${inbox.leads.length})` : `Reservas (${inbox.bookings.length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98A2B3]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar nome, telefone ou email"
            className="w-full rounded-xl border border-[#E4E7EC] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#155EEF]" />
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-[#E4E7EC] bg-white px-3 py-2.5 text-sm">
          <option value="all">Todos os estados</option>
          {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-white p-8 text-center text-sm text-[#667085]">
          {view === 'leads' ? 'Ainda não recebeu leads.' : 'Ainda não recebeu reservas.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const name = r.name || r.customer_name || 'Sem nome';
            const phone = r.phone || r.customer_phone || '';
            const msg = view === 'leads'
              ? `Olá ${name}, recebemos o seu pedido através do biosite ${siteName(r.biosite_id)}.`
              : `Olá ${name}, sobre a sua reserva de ${r.biosite_services?.name || 'serviço'} em ${r.scheduled_date} às ${String(r.scheduled_time).slice(0, 5)}.`;
            return (
              <li key={r.id} className="rounded-2xl border border-[#EEF3F8] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0B1F3A]">{name}</p>
                    <p className="text-xs text-[#667085]">{siteName(r.biosite_id)} · {fmtDate(r.created_at)}</p>
                  </div>
                  <select value={r.status} onChange={(e) => change(r.id, e.target.value)}
                    className="rounded-lg border border-[#E4E7EC] bg-[#F7F9FC] px-2 py-1 text-xs font-semibold">
                    {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                {view === 'bookings' && (
                  <p className="mt-2 text-xs text-[#344054]">
                    {r.biosite_services?.name || 'Serviço'} · {r.scheduled_date} às {String(r.scheduled_time).slice(0, 5)}
                  </p>
                )}
                {(r.message || r.notes) && <p className="mt-2 text-sm text-[#344054] whitespace-pre-line">{r.message || r.notes}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#475467]">
                  {phone && <span>{phone}</span>}
                  {(r.email || r.customer_email) && <span>{r.email || r.customer_email}</span>}
                  {phone && (
                    <a href={waLink(phone, msg)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#155EEF]">
                      <MessageCircle className="h-3.5 w-3.5" />Responder no WhatsApp
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
