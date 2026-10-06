import React, { useState } from 'react';
import { Biosite } from '../types';
import { StorageService } from '../services/storage';
import { openExternalUrl, copyToClipboard } from '../utils/browser';
import {
  Activity,
  Clock,
  ExternalLink,
  Edit3,
  QrCode as QrIcon,
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Eye,
  Smartphone,
} from 'lucide-react';
import { QrCodeModal } from './QrCodeModal';

interface BiositeManagerProps {
  biosites: Biosite[];
  onNavigate: (route: string) => void;
}

export const BiositeManager: React.FC<BiositeManagerProps> = ({
  biosites,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'active' | 'draft'
  >('all');
  const [expandedChecklistId, setExpandedChecklistId] = useState<string | null>(null);
  const [selectedQrBiosite, setSelectedQrBiosite] = useState<Biosite | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick stats
  const activeCount = biosites.filter((b) => b.status === 'published').length;
  const draftCount = biosites.filter((b) => b.status === 'draft').length;

  // Filtered biosites
  const filteredBiosites = biosites.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'active') return b.status === 'published';
    if (selectedFilter === 'draft') return b.status === 'draft';
    return true;
  });

  const handleCopyLink = async (slug: string, id: string) => {
    const url = `${window.location.origin}/b/${slug}`;
    await copyToClipboard(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="biosite-manager-root" className="space-y-6">
      <div className="grid grid-cols-2 gap-3.5">
        {/* ATIVOS NO AR */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
              No Ar / Ativos
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B1F3A]">{activeCount}</span>
            <span className="text-xs text-emerald-600 font-semibold">
              de {biosites.length} biosites
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${biosites.length ? (activeCount / biosites.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* RASCUNHOS / CONSTRUÇÃO */}
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
              Em Construção
            </span>
            <Clock className="h-4 w-4 text-[#667085]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0B1F3A]">{draftCount}</span>
            <span className="text-xs text-[#667085]">em rascunho</span>
          </div>
          <p className="mt-2 text-[11px] text-[#667085]">Prontos para publicação</p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EEF3F8] shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#667085]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar biosite por nome ou categoria..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F7F9FC] border border-[#EEF3F8] focus:border-[#155EEF] outline-none transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'active', label: `Ativos (${activeCount})` },
            { id: 'draft', label: 'Rascunhos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-[#0B1F3A] text-white shadow-2xs'
                  : 'bg-[#F7F9FC] text-[#667085] hover:text-[#0B1F3A] hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. BIOSITES CARDS GRID */}
      {filteredBiosites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EEF3F8] bg-white p-10 text-center">
          <Smartphone className="h-8 w-8 mx-auto text-[#667085] mb-2" />
          <h4 className="text-sm font-bold text-[#0B1F3A]">Nenhum biosite encontrado</h4>
          <p className="text-xs text-[#667085] mt-1">Tente ajustar os filtros ou a busca.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBiosites.map((b) => {
            const publicUrl = `${window.location.origin}/b/${b.slug}`;
            const isPublished = b.status === 'published';
            const progress = StorageService.calculateBiositeProgress(b);
            const isChecklistOpen = expandedChecklistId === b.id;
            return (
              <div
                key={b.id}
                className="rounded-2xl border border-[#EEF3F8] bg-white p-4 sm:p-5 shadow-2xs transition-all hover:border-slate-300"
              >
                {/* ROW 1: HEADER & STATUS BADGES */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* LOGO / AVATAR */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#155EEF] text-white font-black overflow-hidden shadow-2xs">
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{b.name.charAt(0).toUpperCase()}</span>
                      )}
                      {isPublished && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                      )}
                    </div>

                    {/* NAME & SLUG */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#0B1F3A]">
                          {b.name}
                        </h3>
                        <span className="text-[10px] font-semibold text-[#667085] bg-[#F7F9FC] px-2 py-0.5 rounded-full border border-[#EEF3F8]">
                          {b.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button
                          onClick={() => {
                            const opened = openExternalUrl(publicUrl);
                            if (!opened) onNavigate(`/b/${b.slug}`);
                          }}
                          className="text-xs text-[#155EEF] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>/b/{b.slug}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                        <span className="text-[11px] text-[#667085]">•</span>
                        <button
                          onClick={() => handleCopyLink(b.slug, b.id)}
                          className="text-[11px] text-[#667085] hover:text-[#0B1F3A] cursor-pointer"
                        >
                          {copiedId === b.id ? '✓ Copiado!' : 'Copiar link'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    {/* STATUS NO AR BADGE */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{isPublished ? 'Ativo no Ar' : 'Rascunho'}</span>
                    </span>
                  </div>
                </div>

                {/* ROW 2: PROGRESSO & CHECKLIST */}
                <div className="mt-4 rounded-xl bg-[#F7F9FC] p-3 border border-[#EEF3F8]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0B1F3A]">
                        Progresso de Entrega:
                      </span>
                      <span className="text-xs font-black text-[#155EEF]">
                        {progress.percentage}%
                      </span>
                      <span className="text-[11px] text-[#667085]">
                        ({progress.completedCount} de {progress.totalCount} etapas)
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedChecklistId(isChecklistOpen ? null : b.id)
                      }
                      className="text-[11px] text-[#155EEF] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isChecklistOpen ? 'Ocultar checklist' : 'Ver checklist'}</span>
                      {isChecklistOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.percentage === 100
                          ? 'bg-emerald-500'
                          : progress.percentage >= 60
                          ? 'bg-[#155EEF]'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>

                  {/* EXPANDABLE CHECKLIST DETAILS */}
                  {isChecklistOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {progress.steps.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-1.5 text-xs text-[#0B1F3A]"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              st.done
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {st.done ? '✓' : '○'}
                          </span>
                          <span className={st.done ? 'font-medium' : 'text-[#667085]'}>
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ROW 3: TELEMETRY & ACTIONS */}
                <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* METRICAS AO VIVO */}
                  <div className="flex items-center gap-4 text-xs text-[#667085]">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-[#155EEF]" />
                      <strong>{b.viewsCount || 0}</strong> views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <strong>{b.analytics?.whatsappClicks || 0}</strong> no WhatsApp
                    </span>
                  </div>

                  {/* QUICK ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* EDITAR BIOSITE */}
                    <button
                      onClick={() =>
                        onNavigate(`/dashboard/biosites/${b.id}/editor`)
                      }
                      title="Editar biosite"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#EEF3F8] bg-white text-xs font-semibold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#667085]" />
                      <span>Editar</span>
                    </button>

                    {/* QR CODE */}
                    <button
                      onClick={() => setSelectedQrBiosite(b)}
                      title="Ver QR Code"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#155EEF] transition-colors cursor-pointer"
                    >
                      <QrIcon className="h-3.5 w-3.5" />
                    </button>

                    {/* VER NO AR */}
                    <button
                      onClick={() => {
                        const opened = openExternalUrl(publicUrl);
                        if (!opened) onNavigate(`/b/${b.slug}`);
                      }}
                      title="Abrir página pública"
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#155EEF] transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR CODE MODAL */}
      {selectedQrBiosite && (
        <QrCodeModal
          isOpen={Boolean(selectedQrBiosite)}
          onClose={() => setSelectedQrBiosite(null)}
          url={`${window.location.origin}/b/${selectedQrBiosite.slug}`}
          businessName={selectedQrBiosite.name}
        />
      )}
    </div>
  );
};
