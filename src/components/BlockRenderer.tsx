import React from 'react';
import { BiositeBlock } from '../types';

type Ctx = { textColor: string; cardColor: string; buttonColor: string; buttonTextColor?: string; onTrack?: (label: string) => void };

const SIZE: Record<string, string> = { sm: '0.875rem', md: '1rem', lg: '1.375rem', xl: '1.875rem' };
const RADIUS: Record<string, number> = { none: 0, sm: 8, md: 14, lg: 24 };
const PAD: Record<string, string> = { compact: '8px 16px', standard: '16px', large: '28px 16px' };

const safeUrl = (u: unknown) => (typeof u === 'string' && /^(https?:|mailto:|tel:)/i.test(u.trim()) ? u.trim() : undefined);

export function BlockRenderer({ block, ctx }: { block: BiositeBlock; ctx: Ctx }) {
  const c = block.content as Record<string, any>;
  const a = block.appearance as Record<string, any>;
  const align = (a.align as 'left' | 'center' | 'right') || 'left';
  const radius = RADIUS[a.radius || 'md'] ?? 14;
  const shadow = a.shadow ? '0 6px 20px rgba(15,23,42,0.12)' : undefined;
  const glass = !!a.glass;
  const glassAlpha = Math.min(Math.max(Number(a.glassIntensity ?? 40), 10), 80) / 100;
  const surface: React.CSSProperties = glass
    ? { background: `rgba(255,255,255,${glassAlpha * 0.4})`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: radius, padding: 14, boxShadow: shadow }
    : a.card ? { background: ctx.cardColor, borderRadius: radius, padding: 14, boxShadow: shadow, border: a.border ? '1px solid rgba(0,0,0,0.08)' : undefined } : {};

  let inner: React.ReactNode = null;
  switch (block.type) {
    case 'hero': {
      const url = typeof c.url === 'string' ? c.url : '';
      const isVideo = c.mediaType === 'video' || /\.(mp4|webm)(\?|$)/i.test(url);
      const h = block.size === 'large' ? 340 : block.size === 'compact' ? 180 : 250;
      const overlay = Math.min(Math.max(Number(c.overlay ?? 35), 0), 85) / 100;
      const link = safeUrl(c.buttonUrl);
      inner = (
        <div className="relative w-full overflow-hidden" style={{ height: h, borderRadius: radius, boxShadow: shadow }}>
          {url && (isVideo
            ? <video className="absolute inset-0 h-full w-full object-cover" src={url} autoPlay muted loop playsInline preload="metadata" />
            : <img className="absolute inset-0 h-full w-full object-cover" src={url} alt="" loading="lazy" />)}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${url ? overlay : 0})`, ...(url ? {} : { background: ctx.cardColor }) }} />
          <div className="relative flex h-full flex-col justify-end gap-2 p-5" style={{ textAlign: align, alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', color: url ? '#fff' : ctx.textColor }}>
            {c.title && <h2 className="text-2xl font-bold leading-tight">{String(c.title)}</h2>}
            {c.subtitle && <p className="text-sm opacity-90">{String(c.subtitle)}</p>}
            {c.buttonLabel && link && (
              <a href={link} target="_blank" rel="noopener noreferrer" onClick={() => ctx.onTrack?.(String(c.buttonLabel))} className="mt-1 inline-block rounded-full px-5 py-2 text-sm font-semibold" style={{ background: ctx.buttonColor, color: ctx.buttonTextColor || '#fff' }}>{String(c.buttonLabel)}</a>
            )}
          </div>
        </div>
      );
      break;
    }
    case 'text':
      inner = (
        <p className="whitespace-pre-wrap" style={{ textAlign: align, fontSize: SIZE[c.fontSize || 'md'], fontWeight: c.weight === 'bold' ? 700 : c.weight === 'semibold' ? 600 : 400, color: c.color || ctx.textColor, lineHeight: 1.45 }}>
          {String(c.text || '')}
        </p>
      );
      break;
    case 'image':
      inner = typeof c.url === 'string' ? <img loading="lazy" className="w-full object-cover" style={{ borderRadius: radius, boxShadow: shadow }} src={c.url} alt={String(c.alt || '')} /> : null;
      break;
    case 'video':
      inner = typeof c.url === 'string' ? (c.autoplay
        ? <video autoPlay muted loop playsInline preload="metadata" className="w-full" style={{ borderRadius: radius, boxShadow: shadow }} src={c.url} />
        : <video controls preload="none" playsInline className="w-full" style={{ borderRadius: radius, boxShadow: shadow }} src={c.url} />) : null;
      break;
    case 'music':
      inner = typeof c.url === 'string' && /^https:\/\/open\.spotify\.com\/(intl-[a-z]+\/)?(track|album|playlist|episode|show)\/[\w]+/.test(c.url)
        ? <iframe title="Spotify" loading="lazy" allow="encrypted-media" src={c.url.replace(/open\.spotify\.com\/(intl-[a-z]+\/)?/, 'open.spotify.com/embed/')} className="w-full border-0" style={{ height: block.size === 'compact' ? 80 : 152, borderRadius: 12 }} />
        : null;
      break;
    case 'buttons': {
      const items = (Array.isArray(c.items) ? c.items : []).filter((b: any) => b && b.enabled !== false && b.label && safeUrl(b.url));
      inner = (
        <div className="flex flex-col gap-2">
          {items.map((b: any, i: number) => {
            const color = b.color || ctx.buttonColor;
            const outline = b.style === 'outline';
            return (
              <a key={i} href={safeUrl(b.url)} target="_blank" rel="noopener noreferrer" onClick={() => ctx.onTrack?.(String(b.label))}
                className="block w-full px-4 py-3 text-center text-sm font-semibold"
                style={{ borderRadius: b.shape === 'square' ? 6 : b.shape === 'rounded' ? 14 : 999, background: outline ? 'transparent' : color, color: outline ? color : ctx.buttonTextColor || '#fff', border: `1.5px solid ${color}`, boxShadow: shadow }}>
                {String(b.label)}
              </a>
            );
          })}
        </div>
      );
      break;
    }
    case 'spacer':
      inner = <div style={{ height: block.size === 'large' ? 64 : block.size === 'compact' ? 16 : 32 }} />;
      break;
  }
  if (!inner) return null;

  return (
    <section style={{ padding: block.type === 'spacer' ? 0 : PAD[block.size] || PAD.standard, color: ctx.textColor }}>
      <div style={surface}>{inner}</div>
    </section>
  );
}
