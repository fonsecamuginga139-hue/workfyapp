import React, { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { BiositeService } from '../types';
import { StorageService } from '../services/storage';

interface PublicBookingFormProps {
  slug: string;
  service: BiositeService;
  color: string;
  cardColor: string;
  textColor: string;
}

export const PublicBookingForm: React.FC<PublicBookingFormProps> = ({ slug, service, color, cardColor, textColor }) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name: '', phone: '', email: '', date: '', time: '', notes: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.name.trim() || values.phone.replace(/[^0-9]/g, '').length < 7 || !values.date || !values.time) {
      setState('error');
      return;
    }
    setState('sending');
    try {
      await StorageService.submitBooking(slug, service.id, values);
      setState('sent');
      setValues({ name: '', phone: '', email: '', date: '', time: '', notes: '' });
    } catch {
      setState('error');
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-bold underline" style={{ color }}>
        {service.ctaLabel || 'Agendar'}
      </button>
    );
  }

  if (state === 'sent') {
    return (
      <div className="mt-3 rounded-lg border p-4 text-sm" style={{ backgroundColor: cardColor, color: textColor }}>
        <CalendarCheck className="mb-2 h-5 w-5" />
        <strong>Reserva recebida.</strong>
        <p className="mt-1 text-xs opacity-70">O negócio recebeu o pedido e vai confirmar o horário.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg border p-3" style={{ backgroundColor: cardColor, color: textColor }}>
      <input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} required placeholder="Nome" className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      <input value={values.phone} onChange={(e) => setValues({ ...values, phone: e.target.value })} required placeholder="Telefone / WhatsApp" className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      <input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="E-mail opcional" className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={values.date} onChange={(e) => setValues({ ...values, date: e.target.value })} required className="rounded-lg border bg-transparent px-3 py-2 text-sm" />
        <input type="time" value={values.time} onChange={(e) => setValues({ ...values, time: e.target.value })} required className="rounded-lg border bg-transparent px-3 py-2 text-sm" />
      </div>
      <textarea value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} placeholder="Observações" rows={2} className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />
      {state === 'error' && <p className="text-xs text-red-600">Verifique os dados e tente novamente.</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-bold">Cancelar</button>
        <button disabled={state === 'sending'} className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60" style={{ backgroundColor: color }}>{state === 'sending' ? 'Enviando…' : 'Solicitar'}</button>
      </div>
    </form>
  );
};
