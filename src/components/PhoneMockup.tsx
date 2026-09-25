import React from 'react';
import { Biosite } from '../types';
import { BiositeViewer } from './BiositeViewer';

interface PhoneMockupProps {
  biosite: Biosite;
  onOpen?: () => void;
  compact?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ biosite, onOpen, compact = false }) => (
  <article className={`phone-shell ${compact ? 'phone-shell-compact' : ''}`} aria-label={`Pré-visualização de ${biosite.name}`}>
    <div className="phone-island" aria-hidden="true" />
    <div className="phone-screen scrollbar-none">
      <BiositeViewer biosite={biosite} isSimulator />
    </div>
    {onOpen && (
      <button className="phone-open" onClick={onOpen} aria-label={`Abrir biosite ${biosite.name}`}>
        <span>{biosite.name}</span>
        <span aria-hidden="true">↗</span>
      </button>
    )}
  </article>
);
