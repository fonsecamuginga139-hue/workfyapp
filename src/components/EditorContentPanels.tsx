import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Biosite, BiositeBlock, BiositeForm, BiositeService } from '../types';
import { StorageService } from '../services/storage';
import { ImageUploader } from './ImageUploader';

type Props = { tab: 'blocks' | 'services' | 'forms'; biosite: Biosite; onChanged: () => void };

const BLOCK_TYPES: Array<{ id: BiositeBlock['type']; label: string }> = [
  { id: 'text', label: 'Texto' },
  { id: 'image', label: 'Imagem' },
  { id: 'video', label: 'Vídeo' },
  { id: 'music', label: 'Música (Spotify)' },
  { id: 'spacer', label: 'Espaço' },
];

const input = 'w-full rounded-xl border border-[#E4E7EC] bg-white px-3 py-2.5 text-sm text-[#0B1F3A] outline-none focus:border-[#0066FF]';
const label = 'block text-xs font-semibold text-[#344054] mb-1';
const iconBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F2F4F7] disabled:opacity-40';
const primary = 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

export function EditorContentPanels({ tab, biosite, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true); setError(null);
    try { await fn(); onChanged(); } catch (e) { setError(e instanceof Error ? e.message : 'Ocorreu um erro.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {tab === 'blocks' && <BlocksPanel biosite={biosite} busy={busy} run={run} />}
      {tab === 'services' && <ServicesPanel biosite={biosite} busy={busy} run={run} />}
      {tab === 'forms' && <FormsPanel biosite={biosite} busy={busy} run={run} />}
    </div>
  );
}

type PanelProps = { biosite: Biosite; busy: boolean; run: (fn: () => Promise<unknown>) => Promise<void> };

function BlocksPanel({ biosite, busy, run }: PanelProps) {
  const [type, setType] = useState<BiositeBlock['type']>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const blocks = [...(biosite.blocks || [])].sort((a, b) => a.position - b.position);

  const add = () => {
    if (type === 'text' ? !text.trim() : type !== 'spacer' && !url.trim()) return;
    const content = type === 'text' ? { text: text.trim() } : type === 'spacer' ? {} : { url: url.trim() };
    return run(async () => {
      await StorageService.saveBlock(biosite.id, { id: `block-${Date.now()}`, biositeId: biosite.id, ownerId: biosite.userId, type, enabled: true, size: 'standard', position: blocks.length + 1, content, appearance: {} });
      setText(''); setUrl('');
    });
  };

  const move = (index: number, dir: -1 | 1) => run(async () => {
    const a = blocks[index]; const b = blocks[index + dir];
    if (!a || !b) return;
    await StorageService.saveBlock(biosite.id, { ...a, position: b.position });
    await StorageService.saveBlock(biosite.id, { ...b, position: a.position });
  });

  return (
    <>
      <section className="rounded-2xl border border-[#E4E7EC] bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Adicionar bloco</h3>
        <div>
          <span className={label}>Tipo</span>
          <select className={input} value={type} onChange={(e) => setType(e.target.value as BiositeBlock['type'])}>
            {BLOCK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        {type === 'text' && <textarea className={input} rows={3} maxLength={1500} placeholder="Escreva o texto" value={text} onChange={(e) => setText(e.target.value)} />}
        {(type === 'image' || type === 'video') && (
          <ImageUploader label={type === 'image' ? 'Imagem' : 'Vídeo'} value={url} onChange={setUrl} acceptVideo={type === 'video'} aspectRatio="wide" />
        )}
        {type === 'music' && <input className={input} placeholder="Link do Spotify" value={url} onChange={(e) => setUrl(e.target.value)} />}
        <button type="button" className={primary} disabled={busy} onClick={add}><Plus className="h-4 w-4" />Adicionar</button>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Blocos ({blocks.length})</h3>
        {blocks.length === 0 && <p className="text-xs text-[#667085]">Ainda não há blocos neste biosite.</p>}
        {blocks.map((block, i) => (
          <BlockRow key={block.id} block={block} index={i} total={blocks.length} busy={busy}
            onMove={(d) => move(i, d)}
            onSave={(patch) => run(() => StorageService.saveBlock(biosite.id, { ...block, ...patch }))}
            onDuplicate={() => run(() => StorageService.saveBlock(biosite.id, { ...block, id: `block-${Date.now()}`, position: blocks.length + 1 }))}
            onDelete={() => { if (confirm('Remover este bloco?')) run(() => StorageService.deleteBlock(biosite.id, block.id)); }}
          />
        ))}
      </section>
    </>
  );
}

function BlockRow({ block, index, total, busy, onMove, onSave, onDuplicate, onDelete }: {
  block: BiositeBlock; index: number; total: number; busy: boolean;
  onMove: (d: -1 | 1) => void; onSave: (p: Partial<BiositeBlock>) => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String((block.content as any)?.text ?? (block.content as any)?.url ?? ''));
  const typeLabel = BLOCK_TYPES.find((t) => t.id === block.type)?.label || block.type;
  const key = block.type === 'text' ? 'text' : 'url';

  return (
    <div className={`rounded-2xl border bg-white p-3 ${block.enabled ? 'border-[#E4E7EC]' : 'border-dashed border-[#D0D5DD] opacity-70'}`}>
      <div className="flex items-center gap-2">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(!open)}>
          <p className="text-sm font-semibold text-[#0B1F3A]">{typeLabel}</p>
          <p className="truncate text-xs text-[#667085]">{value || '—'}</p>
        </button>
        <button type="button" aria-label="Subir" className={iconBtn} disabled={busy || index === 0} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
        <button type="button" aria-label="Descer" className={iconBtn} disabled={busy || index === total - 1} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-[#F2F4F7] pt-3">
          {block.type === 'text' && <textarea className={input} rows={3} value={value} onChange={(e) => setValue(e.target.value)} />}
          {(block.type === 'image' || block.type === 'video') && <ImageUploader label="Ficheiro" value={value} onChange={setValue} acceptVideo={block.type === 'video'} aspectRatio="wide" />}
          {block.type === 'music' && <input className={input} value={value} onChange={(e) => setValue(e.target.value)} />}
          <div>
            <span className={label}>Tamanho</span>
            <select className={input} value={block.size} onChange={(e) => onSave({ size: e.target.value as BiositeBlock['size'] })}>
              <option value="compact">Compacto</option><option value="standard">Normal</option><option value="large">Grande</option>
            </select>
          </div>
          {block.type !== 'spacer' && (
            <button type="button" className={primary} disabled={busy} onClick={() => onSave({ content: { ...block.content, [key]: value.trim() } })}>Guardar alterações</button>
          )}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <button type="button" aria-label={block.enabled ? 'Ocultar' : 'Mostrar'} className={iconBtn} disabled={busy} onClick={() => onSave({ enabled: !block.enabled })}>{block.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
        <button type="button" aria-label="Duplicar" className={iconBtn} disabled={busy} onClick={onDuplicate}><Copy className="h-4 w-4" /></button>
        <button type="button" aria-label="Remover" className={iconBtn} disabled={busy} onClick={onDelete}><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function ServicesPanel({ biosite, busy, run }: PanelProps) {
  const empty = { name: '', description: '', price: '', duration: '', mediaUrl: '', ctaType: 'booking' as BiositeService['ctaType'] };
  const [f, setF] = useState(empty);
  const services = [...(biosite.servicesData || [])].sort((a, b) => a.position - b.position);

  const add = () => {
    if (f.name.trim().length < 2) return;
    return run(async () => {
      await StorageService.createService(biosite.id, {
        name: f.name.trim().slice(0, 120), description: f.description.trim().slice(0, 1000),
        price: f.price ? Number(f.price) : undefined, durationMinutes: f.duration ? Number(f.duration) : undefined,
        mediaType: /\.(mp4|webm)(\?|$)/i.test(f.mediaUrl) ? 'video' : 'image', mediaUrl: f.mediaUrl || undefined,
        ctaType: f.ctaType, ctaLabel: f.ctaType === 'booking' ? 'Agendar' : f.ctaType === 'whatsapp' ? 'Pedir no WhatsApp' : 'Saber mais',
        featured: false, available: true, position: services.length + 1,
      });
      setF(empty);
    });
  };

  return (
    <>
      <section className="rounded-2xl border border-[#E4E7EC] bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Novo serviço</h3>
        <input className={input} placeholder="Nome do serviço" maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <textarea className={input} rows={2} placeholder="Descrição" maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className={input} type="number" min={0} placeholder="Preço (Kz)" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
          <input className={input} type="number" min={0} placeholder="Duração (min)" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
        </div>
        <ImageUploader label="Imagem ou vídeo" value={f.mediaUrl} onChange={(v) => setF({ ...f, mediaUrl: v })} acceptVideo aspectRatio="wide" />
        <div>
          <span className={label}>Botão</span>
          <select className={input} value={f.ctaType} onChange={(e) => setF({ ...f, ctaType: e.target.value as BiositeService['ctaType'] })}>
            <option value="booking">Agendar</option><option value="whatsapp">Pedir no WhatsApp</option><option value="info">Saber mais</option>
          </select>
        </div>
        <button type="button" className={primary} disabled={busy} onClick={add}><Plus className="h-4 w-4" />Adicionar serviço</button>
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Serviços ({services.length})</h3>
        {services.length === 0 && <p className="text-xs text-[#667085]">Ainda não há serviços.</p>}
        {services.map((s) => (
          <div key={s.id} className={`flex items-center gap-2 rounded-2xl border bg-white p-3 ${s.available ? 'border-[#E4E7EC]' : 'border-dashed opacity-70'}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0B1F3A]">{s.name}</p>
              <p className="text-xs text-[#667085]">{s.price != null ? `${s.price} Kz` : 'Sem preço'}{s.durationMinutes ? ` · ${s.durationMinutes} min` : ''}</p>
            </div>
            <button type="button" aria-label="Ocultar" className={iconBtn} disabled={busy} onClick={() => run(() => StorageService.updateService(s.id, { available: !s.available }))}>{s.available ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
            <button type="button" aria-label="Remover" className={iconBtn} disabled={busy} onClick={() => { if (confirm('Remover este serviço?')) run(() => StorageService.deleteService(s.id)); }}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
    </>
  );
}

function FormsPanel({ biosite, busy, run }: PanelProps) {
  const [title, setTitle] = useState('Pedir contacto');
  const [withEmail, setWithEmail] = useState(false);
  const forms = [...(biosite.formsData || [])].sort((a, b) => a.position - b.position);

  const add = () => run(async () => {
    const fields: BiositeForm['fields'] = [
      { id: 'name', type: 'text', label: 'Nome', required: true },
      { id: 'phone', type: 'tel', label: 'Telefone / WhatsApp', required: true },
      ...(withEmail ? [{ id: 'email', type: 'email' as const, label: 'Email', required: false }] : []),
      { id: 'message', type: 'textarea', label: 'Mensagem', required: false },
    ];
    await StorageService.createForm(biosite.id, { title: title.trim().slice(0, 120) || 'Pedir contacto', description: 'Preencha os dados para o negócio responder.', submitLabel: 'Enviar', enabled: true, position: forms.length + 1, fields });
  });

  return (
    <>
      <section className="rounded-2xl border border-[#E4E7EC] bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Novo formulário de contacto</h3>
        <p className="text-xs text-[#667085]">Os pedidos enviados aparecem no separador Leads do painel.</p>
        <input className={input} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-[#344054]"><input type="checkbox" checked={withEmail} onChange={(e) => setWithEmail(e.target.checked)} />Pedir email</label>
        <button type="button" className={primary} disabled={busy} onClick={add}><Plus className="h-4 w-4" />Criar formulário</button>
      </section>
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Formulários ({forms.length})</h3>
        {forms.length === 0 && <p className="text-xs text-[#667085]">Ainda não há formulários.</p>}
        {forms.map((fm) => (
          <div key={fm.id} className={`flex items-center gap-2 rounded-2xl border bg-white p-3 ${fm.enabled ? 'border-[#E4E7EC]' : 'border-dashed opacity-70'}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0B1F3A]">{fm.title}</p>
              <p className="text-xs text-[#667085]">{fm.fields.length} campos</p>
            </div>
            <button type="button" aria-label="Ocultar" className={iconBtn} disabled={busy} onClick={() => run(() => StorageService.updateForm(fm.id, { enabled: !fm.enabled }))}>{fm.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
            <button type="button" aria-label="Remover" className={iconBtn} disabled={busy} onClick={() => { if (confirm('Remover este formulário?')) run(() => StorageService.deleteForm(fm.id)); }}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </section>
    </>
  );
}
