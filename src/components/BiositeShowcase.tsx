import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Biosite } from '../types';
import { StorageService } from '../services/storage';
import { PhoneMockup } from './PhoneMockup';

interface BiositeShowcaseProps { onNavigate: (route: string) => void; }

export const BiositeShowcase: React.FC<BiositeShowcaseProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<Biosite[]>([]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => { StorageService.listShowcaseBiosites(8).then(setItems); }, []);
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); if (media.matches) setPaused(true); const update = () => setPaused(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % items.length), 5200);
    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  const visible = useMemo(() => {
    if (!items.length) return [];
    return [0, 1, 2].map((offset) => items[(active + offset) % items.length]).filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index);
  }, [active, items]);

  if (!items.length) return null;

  return (
    <section className="showcase-stage" aria-label="Biosites criados na Workfy" onMouseEnter={() => setPaused(true)} onMouseLeave={() => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(false); }} onFocusCapture={() => setPaused(true)} onBlurCapture={() => { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(false); }}>
      <div className="showcase-toolbar">
        <div>
          <p className="showcase-kicker">Criados por utilizadores Workfy</p>
          <h2>Biosites reais, em movimento.</h2>
        </div>
        {items.length > 1 && (
          <button className="showcase-pause" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Continuar apresentação' : 'Pausar apresentação'}>
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}
      </div>
      <div className="showcase-viewport" aria-live="polite">
        <div className="showcase-track" key={active}>
          {visible.map((biosite, index) => (
            <div className={`showcase-phone showcase-phone-${index}`} key={biosite.id}>
              <PhoneMockup biosite={biosite} compact={index > 0} onOpen={() => onNavigate(`/b/${biosite.slug}`)} />
            </div>
          ))}
        </div>
      </div>
      <div className="showcase-dots" role="tablist" aria-label="Escolher biosite">
        {items.map((item, index) => <button key={item.id} className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Mostrar ${item.name}`} />)}
      </div>
    </section>
  );
};
