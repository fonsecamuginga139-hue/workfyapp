import React, { useState } from 'react';
import { Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Biosite, BiositeBlock, BiositeForm, BiositeService } from '../types';
import { StorageService } from '../services/storage';
import { ImageUploader } from './ImageUploader';

type Props = { tab: 'blocks' | 'services' | 'forms'; biosite: Biosite; onChanged: () => void };

const BLOCK_TYPES: Array<{ id: BiositeBlock['type']; label: string }> = [
  { id: 'hero', label: 'Banner (Hero)' },
  { id: 'text', label: 'Título / Texto' },
  { id: 'buttons', label: 'Botões' },
  { id: 'image', label: 'Imagem' },
  { id: 'video', label: 'Vídeo' },
  { id: 'music', label: 'Música (Spotify)' },
  { id: 'sticker', label: 'Elemento decorativo' },
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

const defaultContent = (type: BiositeBlock['type']): Record<string, unknown> => {
  switch (type) {
    case 'hero': return { title: '', subtitle: '', url: '', overlay: 35, buttonLabel: '', buttonUrl: '' };
    case 'text': return { text: '', fontSize: 'md', weight: 'normal' };
    case 'buttons': return { items: [{ label: '', url: '', style: 'solid', shape: 'pill', enabled: true }] };
    case 'sticker': return { symbol: '✦', x: 50, y: 50, scale: 100, rotation: 0, opacity: 100 };
    default: return { url: '' };
  }
};

function BlocksPanel({ biosite, busy, run }: PanelProps) {
  const [type, setType] = useState<BiositeBlock['type']>('hero');
  const blocks = [...(biosite.blocks || [])].sort((a, b) => a.position - b.position);
  const [order, setOrder] = useState<string[] | null>(null);
  const ordered = order ? order.map((id) => blocks.find((b) => b.id === id)).filter(Boolean) as BiositeBlock[] : blocks;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const add = () => run(async () => {
    await StorageService.saveBlock(biosite.id, { id: `block-${Date.now()}`, biositeId: biosite.id, ownerId: biosite.userId, type, enabled: true, size: 'standard', position: blocks.length + 1, content: defaultContent(type), appearance: { align: type === 'hero' ? 'center' : 'left', radius: 'md' } });
  });

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const ids = ordered.map((b) => b.id);
    const next = arrayMove(ids, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)));
    setOrder(next);
    run(async () => {
      for (let i = 0; i < next.length; i++) {
        const b = blocks.find((x) => x.id === next[i]);
        if (b && b.position !== i + 1) await StorageService.saveBlock(biosite.id, { ...b, position: i + 1 });
      }
    }).finally(() => setOrder(null));
  };

  return (
    <>
      <section className="rounded-2xl border border-[#E4E7EC] bg-white p-4 space-y-3">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Adicionar bloco</h3>
        <select className={input} value={type} onChange={(e) => setType(e.target.value as BiositeBlock['type'])}>
          {BLOCK_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <button type="button" className={primary} disabled={busy} onClick={add}><Plus className="h-4 w-4" />Adicionar e editar</button>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Blocos ({blocks.length})</h3>
        {blocks.length > 1 && <p className="text-xs text-[#667085]">Arraste pela pega para mudar a ordem.</p>}
        {blocks.length === 0 && <p className="text-xs text-[#667085]">Ainda não há blocos neste biosite.</p>}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ordered.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {ordered.map((block) => (
              <BlockRow key={block.id} block={block} busy={busy}
                onSave={(patch) => run(() => StorageService.saveBlock(biosite.id, { ...block, ...patch }))}
                onDuplicate={() => run(() => StorageService.saveBlock(biosite.id, { ...block, id: `block-${Date.now()}`, position: blocks.length + 1 }))}
                onDelete={() => { if (confirm('Remover este bloco?')) run(() => StorageService.deleteBlock(biosite.id, block.id)); }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </section>
    </>
  );
}

const summary = (b: BiositeBlock) => {
  const c = b.content as any;
  if (b.type === 'hero') return c.title || c.url || '';
  if (b.type === 'buttons') return (c.items || []).map((i: any) => i.label).filter(Boolean).join(' · ');
  return c.text || c.url || '';
};

function Seg({ value, options, onChange }: { value: string; options: Array<[string, string]>; onChange: (v: string) => void }) {
  return (
    <div className="flex rounded-xl border border-[#E4E7EC] p-0.5">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold ${value === v ? 'bg-[#0066FF] text-white' : 'text-[#475467]'}`}>{l}</button>
      ))}
    </div>
  );
}

const STICKERS = ['✦', '★', '♥', '✓', '☀', '●', '◆', '↗'];

function StickerPositionEditor({ content, onChange }: { content: Record<string, any>; onChange: (key: string, value: unknown) => void }) {
  const updatePosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    onChange('x', Math.round(Math.min(Math.max(((event.clientX - bounds.left) / bounds.width) * 100, 0), 100)));
    onChange('y', Math.round(Math.min(Math.max(((event.clientY - bounds.top) / bounds.height) * 100, 0), 100)));
  };
  return (
    <div
      className="relative h-36 w-full touch-none overflow-hidden rounded-xl border border-[#E4E7EC] bg-[#F7F9FC]"
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updatePosition(event); }}
      onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updatePosition(event); }}
      aria-label="Posição do elemento"
    >
      <div className="absolute select-none" style={{ left: `${content.x ?? 50}%`, top: `${content.y ?? 50}%`, opacity: Number(content.opacity ?? 100) / 100, transform: `translate(-50%, -50%) scale(${Number(content.scale ?? 100) / 100}) rotate(${Number(content.rotation ?? 0)}deg)` }}>
        {content.url ? <img src={content.url} alt="" draggable={false} className="h-14 w-14 object-contain" /> : <span className="block text-4xl leading-none">{content.symbol || '✦'}</span>}
      </div>
    </div>
  );
}

function BlockRow({ block, busy, onSave, onDuplicate, onDelete }: {
  block: BiositeBlock; busy: boolean;
  onSave: (p: Partial<BiositeBlock>) => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [c, setC] = useState<Record<string, any>>({ ...(block.content as any) });
  const [a, setA] = useState<Record<string, any>>({ ...(block.appearance as any) });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const typeLabel = BLOCK_TYPES.find((t) => t.id === block.type)?.label || block.type;
  const set = (k: string, v: unknown) => setC((p) => ({ ...p, [k]: v }));
  const setAp = (k: string, v: unknown) => setA((p) => ({ ...p, [k]: v }));
  const items: any[] = Array.isArray(c.items) ? c.items : [];
  const setItem = (i: number, k: string, v: unknown) => set('items', items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={`rounded-2xl border bg-white p-3 ${isDragging ? 'shadow-lg' : ''} ${block.enabled ? 'border-[#E4E7EC]' : 'border-dashed border-[#D0D5DD] opacity-70'}`}>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Arrastar" className={`${iconBtn} cursor-grab touch-none`} {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></button>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen(!open)}>
          <p className="text-sm font-semibold text-[#0B1F3A]">{typeLabel}</p>
          <p className="truncate text-xs text-[#667085]">{summary(block) || 'Toque para editar'}</p>
        </button>
        <button type="button" aria-label={block.enabled ? 'Ocultar' : 'Mostrar'} className={iconBtn} disabled={busy} onClick={() => onSave({ enabled: !block.enabled })}>{block.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
        <button type="button" aria-label="Duplicar" className={iconBtn} disabled={busy} onClick={onDuplicate}><Copy className="h-4 w-4" /></button>
        <button type="button" aria-label="Remover" className={iconBtn} disabled={busy} onClick={onDelete}><Trash2 className="h-4 w-4" /></button>
      </div>
      {open && (
        <div className="mt-3 space-y-3 border-t border-[#F2F4F7] pt-3">
          {block.type === 'hero' && (<>
            <ImageUploader label="Imagem ou vídeo de fundo" value={c.url || ''} onChange={(v) => set('url', v)} acceptVideo aspectRatio="wide" />
            <input className={input} maxLength={90} placeholder="Título" value={c.title || ''} onChange={(e) => set('title', e.target.value)} />
            <input className={input} maxLength={180} placeholder="Subtítulo" value={c.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={input} maxLength={40} placeholder="Texto do botão" value={c.buttonLabel || ''} onChange={(e) => set('buttonLabel', e.target.value)} />
              <input className={input} placeholder="https://..." value={c.buttonUrl || ''} onChange={(e) => set('buttonUrl', e.target.value)} />
            </div>
            <div><span className={label}>Escurecimento: {c.overlay ?? 35}%</span><input type="range" min={0} max={85} value={c.overlay ?? 35} onChange={(e) => set('overlay', Number(e.target.value))} className="w-full" /></div>
          </>)}
          {block.type === 'text' && (<>
            <textarea className={input} rows={3} maxLength={1500} value={c.text || ''} onChange={(e) => set('text', e.target.value)} placeholder="Escreva o texto" />
            <div><span className={label}>Tamanho do texto</span><Seg value={c.fontSize || 'md'} onChange={(v) => set('fontSize', v)} options={[['sm', 'P'], ['md', 'M'], ['lg', 'G'], ['xl', 'Título']]} /></div>
            <div><span className={label}>Peso</span><Seg value={c.weight || 'normal'} onChange={(v) => set('weight', v)} options={[['normal', 'Normal'], ['semibold', 'Médio'], ['bold', 'Negrito']]} /></div>
            <div className="flex items-center gap-2"><span className={label}>Cor</span><input type="color" value={c.color || '#0B1F3A'} onChange={(e) => set('color', e.target.value)} className="h-8 w-12 rounded border" />{c.color && <button type="button" className="text-xs underline text-[#667085]" onClick={() => set('color', undefined)}>Usar cor do tema</button>}</div>
          </>)}
          {block.type === 'buttons' && (<>
            {items.map((it, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-[#F2F4F7] p-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className={input} maxLength={50} placeholder="Texto" value={it.label || ''} onChange={(e) => setItem(i, 'label', e.target.value)} />
                  <input className={input} placeholder="https:// ou tel:" value={it.url || ''} onChange={(e) => setItem(i, 'url', e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="color" aria-label="Cor" value={it.color || '#0066FF'} onChange={(e) => setItem(i, 'color', e.target.value)} className="h-8 w-10 rounded border" />
                  <select className="rounded-lg border px-2 py-1.5 text-xs" value={it.style || 'solid'} onChange={(e) => setItem(i, 'style', e.target.value)}><option value="solid">Cheio</option><option value="outline">Contorno</option></select>
                  <select className="rounded-lg border px-2 py-1.5 text-xs" value={it.shape || 'pill'} onChange={(e) => setItem(i, 'shape', e.target.value)}><option value="pill">Redondo</option><option value="rounded">Suave</option><option value="square">Reto</option></select>
                  <button type="button" className={iconBtn} aria-label="Ocultar botão" onClick={() => setItem(i, 'enabled', it.enabled === false)}>{it.enabled === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button type="button" className={iconBtn} aria-label="Remover botão" onClick={() => set('items', items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {items.length < 8 && <button type="button" className="text-xs font-semibold text-[#0066FF]" onClick={() => set('items', [...items, { label: '', url: '', style: 'solid', shape: 'pill', enabled: true }])}>+ Adicionar botão</button>}
          </>)}
          {(block.type === 'image' || block.type === 'video') && <ImageUploader label="Ficheiro" value={c.url || ''} onChange={(v) => set('url', v)} acceptVideo={block.type === 'video'} aspectRatio="wide" />}
          {block.type === 'video' && <label className="flex items-center gap-2 text-sm text-[#344054]"><input type="checkbox" checked={!!c.autoplay} onChange={(e) => set('autoplay', e.target.checked)} />Tocar sozinho, sem som e em loop</label>}
          {block.type === 'music' && <input className={input} placeholder="https://open.spotify.com/track/..." value={c.url || ''} onChange={(e) => set('url', e.target.value)} />}
          {block.type === 'sticker' && (<>
            <div><span className={label}>Escolher elemento</span><div className="grid grid-cols-8 gap-1">{STICKERS.map((symbol) => <button key={symbol} type="button" aria-label={`Elemento ${symbol}`} onClick={() => { set('symbol', symbol); set('url', ''); }} className={`h-9 rounded-lg border text-lg ${!c.url && c.symbol === symbol ? 'border-[#0066FF] bg-blue-50' : 'border-[#E4E7EC] bg-white'}`}>{symbol}</button>)}</div></div>
            <ImageUploader label="Ou usar imagem própria" value={c.url || ''} onChange={(value) => set('url', value)} aspectRatio="square" maxDimension={600} />
            <div><span className={label}>Arraste para posicionar</span><StickerPositionEditor content={c} onChange={set} /></div>
            <div><span className={label}>Tamanho: {c.scale ?? 100}%</span><input type="range" min={40} max={220} value={c.scale ?? 100} onChange={(e) => set('scale', Number(e.target.value))} className="w-full" /></div>
            <div><span className={label}>Rotação: {c.rotation ?? 0}°</span><input type="range" min={-180} max={180} value={c.rotation ?? 0} onChange={(e) => set('rotation', Number(e.target.value))} className="w-full" /></div>
            <div><span className={label}>Opacidade: {c.opacity ?? 100}%</span><input type="range" min={10} max={100} value={c.opacity ?? 100} onChange={(e) => set('opacity', Number(e.target.value))} className="w-full" /></div>
          </>)}

          <div><span className={label}>Tamanho</span><Seg value={block.size} onChange={(v) => onSave({ size: v as BiositeBlock['size'] })} options={[['compact', 'Compacto'], ['standard', 'Normal'], ['large', 'Grande']]} /></div>
          {block.type !== 'spacer' && (<>
            <div><span className={label}>Alinhamento</span><Seg value={a.align || 'left'} onChange={(v) => setAp('align', v)} options={[['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']]} /></div>
            <div><span className={label}>Cantos</span><Seg value={a.radius || 'md'} onChange={(v) => setAp('radius', v)} options={[['none', 'Retos'], ['sm', 'Leves'], ['md', 'Médios'], ['lg', 'Grandes']]} /></div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#344054]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!a.card} onChange={(e) => setAp('card', e.target.checked)} />Fundo de cartão</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!a.border} onChange={(e) => setAp('border', e.target.checked)} />Borda</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!a.shadow} onChange={(e) => setAp('shadow', e.target.checked)} />Sombra</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!a.glass} onChange={(e) => setAp('glass', e.target.checked)} />Efeito vidro</label>
            </div>
            {a.glass && <div><span className={label}>Intensidade do vidro: {a.glassIntensity ?? 40}%</span><input type="range" min={10} max={80} value={a.glassIntensity ?? 40} onChange={(e) => setAp('glassIntensity', Number(e.target.value))} className="w-full" /></div>}
            <button type="button" className={primary} disabled={busy} onClick={() => onSave({ content: c, appearance: a })}>Guardar alterações</button>
          </>)}
        </div>
      )}
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
