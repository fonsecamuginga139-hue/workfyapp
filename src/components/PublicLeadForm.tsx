import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BiositeForm } from '../types';
import { StorageService } from '../services/storage';

export const PublicLeadForm: React.FC<{ form: BiositeForm; slug: string; color: string; cardColor: string; textColor: string }> = ({ form, slug, color, cardColor, textColor }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const hasContact = Object.entries(values).some(([key, value]) => ['name','phone','email','message'].includes(key) && value.trim().length > 0);
    if (!hasContact) { setState('error'); return; }
    setState('sending');
    try { await StorageService.submitForm(slug, form.id, values); setState('sent'); setValues({}); }
    catch { setState('error'); }
  };
  if (state === 'sent') return <div className="rounded-lg border p-5 text-center" style={{ backgroundColor: cardColor, color: textColor }}><CheckCircle2 className="mx-auto mb-2" /><strong>Informações enviadas.</strong><p className="mt-1 text-xs opacity-70">O negócio recebeu o seu contacto.</p></div>;
  return <form onSubmit={submit} className="rounded-lg border p-4 space-y-3" style={{ backgroundColor: cardColor, color: textColor }}>
    <div><h3 className="font-bold">{form.title}</h3>{form.description && <p className="mt-1 text-xs opacity-70">{form.description}</p>}</div>
    {form.fields.map((field) => field.type === 'textarea' ? <textarea key={field.id} required={field.required} value={values[field.id] || ''} onChange={(e) => setValues({...values,[field.id]:e.target.value})} placeholder={field.label} className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" rows={3}/> : <input key={field.id} type={field.type} required={field.required} value={values[field.id] || ''} onChange={(e) => setValues({...values,[field.id]:e.target.value})} placeholder={field.label} className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" />)}
    {state === 'error' && <p className="text-xs text-red-600">Preencha pelo menos um contacto válido e tente novamente.</p>}
    <button disabled={state === 'sending'} className="w-full rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60" style={{ backgroundColor: color, color: '#fff' }}>{state === 'sending' ? 'Enviando…' : form.submitLabel}</button>
  </form>;
};
