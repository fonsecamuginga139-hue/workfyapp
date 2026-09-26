import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Biosite } from '../types';
import { BiositeViewer } from './BiositeViewer';
import { QrCodeModal } from './QrCodeModal';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface PublicBiositePageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const PublicBiositePage: React.FC<PublicBiositePageProps> = ({ slug, onNavigate }) => {
  const [biosite, setBiosite] = useState<Biosite | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [localBiosites, setLocalBiosites] = useState<Biosite[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    StorageService.fetchPublicBiosite(slug).then((found) => {
      if (!active) return;
      if (found) {
        setBiosite(found);
        if (found.status === 'published') StorageService.trackEvent(found.slug, 'view');
      } else {
        setLocalBiosites(StorageService.getBiosites());
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!biosite) return;
    const originalTitle = document.title;
    const title = biosite.seo?.title || `${biosite.name} | Workfy`;
    document.title = title;
    const description = biosite.seo?.description || biosite.shortDescription;
    const tags = ['description', 'og:title', 'og:description'];
    const previous = tags.map((name) => {
      const selector = name.startsWith('og:') ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      const tag = document.querySelector<HTMLMetaElement>(selector);
      const value = tag?.content;
      if (tag) tag.content = name === 'og:title' ? title : description;
      return { tag, value };
    });
    return () => { document.title = originalTitle; previous.forEach(({tag,value}) => { if (tag && value !== undefined) tag.content = value; }); };
  }, [biosite]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#155EEF] border-t-transparent" />
          <span className="text-xs font-semibold text-[#667085]">Carregando biosite...</span>
        </div>
      </div>
    );
  }

  if (!biosite) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC] p-4 text-center">
        <div className="rounded-2xl bg-white p-8 border border-[#EEF3F8] shadow-xs max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-[#0B1F3A]">Biosite não encontrado</h2>
          <p className="mt-1 text-xs text-[#667085]">
            O endereço <strong className="text-[#0B1F3A]">/b/{slug}</strong> não foi encontrado ou o link foi modificado.
          </p>

          {localBiosites.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-[#F7F9FC] border border-[#EEF3F8] text-left">
              <span className="text-[11px] font-bold text-[#667085] uppercase tracking-wider block mb-2">
                Seus biosites criados:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {localBiosites.map((lb) => (
                  <button
                    key={lb.id}
                    onClick={() => onNavigate(`/b/${lb.slug}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-[#EEF3F8] hover:border-[#155EEF] text-xs font-semibold text-[#0B1F3A] transition-colors cursor-pointer text-left"
                  >
                    <span className="truncate">{lb.name}</span>
                    <span className="text-[11px] text-[#155EEF] shrink-0 font-normal">/b/{lb.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex-1 rounded-xl bg-[#155EEF] py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Meu Painel
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="flex-1 rounded-xl border border-[#EEF3F8] bg-white py-2.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#667085]" />
              Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = StorageService.getCurrentUser();
  const allUserBiosites = StorageService.getBiosites();
  const isOwner = Boolean(
    (currentUser && biosite.userId && biosite.userId === currentUser.id) ||
    allUserBiosites.some((b) => b.id === biosite.id)
  );

  const handleTrackAction = (
    type: 'whatsapp' | 'call' | 'location' | 'appointment' | 'product',
    label?: string
  ) => {
    StorageService.trackEvent(slug, type, label);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* OWNER MANAGEMENT BAR */}
      {isOwner && (
        <div className="sticky top-0 z-50 bg-[#0B1F3A]/95 backdrop-blur-md text-white px-4 py-2 text-xs flex items-center justify-between border-b border-white/10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/90">Visualização Pública</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/dashboard/biosites/${biosite.id}/editor`)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              Editar Biosite
            </button>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-2.5 py-1 rounded-lg bg-[#155EEF] hover:bg-[#124bbf] text-white font-medium transition-colors cursor-pointer"
            >
              Painel
            </button>
          </div>
        </div>
      )}

      <BiositeViewer
        biosite={biosite}
        isSimulator={false}
        onOpenQrCode={() => setShowQrModal(true)}
        onTrackAction={handleTrackAction}
      />

      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={window.location.href}
        businessName={biosite.name}
      />
    </div>
  );
};
