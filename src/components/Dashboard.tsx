import React, { useState, useEffect } from 'react';
import { Biosite, User } from '../types';
import { StorageService, formatKz } from '../services/storage';
import { openExternalUrl, copyToClipboard } from '../utils/browser';
import {
  Plus,
  ExternalLink,
  Edit3,
  QrCode as QrIcon,
  BarChart3,
  Trash2,
  Copy,
  Check,
  Smartphone,
  LogOut,
  User as UserIcon,
  Rocket,
  Activity,
  DollarSign,
  LayoutGrid,
  Inbox,
} from 'lucide-react';
import { QrCodeModal } from './QrCodeModal';
import { WorkfyLogo } from './WorkfyLogo';
import { BottomNavigation, ActiveNavTab } from './BottomNavigation';
import { BiositeManager } from './BiositeManager';
import { SalesDashboard } from './SalesDashboard';
import { SellBiositeModal } from './SellBiositeModal';
import { InboxPanel } from './InboxPanel';

interface DashboardProps {
  user: User;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  initialTab?: 'biosites' | 'manager' | 'inbox' | 'vendas';
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  onNavigate,
  onLogout,
  initialTab = 'biosites',
}) => {
  const [activeTab, setActiveTab] = useState<'biosites' | 'manager' | 'inbox' | 'vendas'>(initialTab);
  const [inbox, setInbox] = useState<{ leads: any[]; bookings: any[] }>({ leads: [], bookings: [] });
  const [biosites, setBiosites] = useState<Biosite[]>(() =>
    StorageService.getBiosites(user.id)
  );
  const [selectedQrBiosite, setSelectedQrBiosite] = useState<Biosite | null>(null);
  const [selectedSellBiosite, setSelectedSellBiosite] = useState<Biosite | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const reloadBiosites = () => {
    setBiosites(StorageService.getBiosites(user.id));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o biosite "${name}"?`)) {
      const ok = await StorageService.deleteBiosite(id);
      if (!ok) window.alert('Não foi possível excluir. Tente novamente.');
      reloadBiosites();
    }
  };

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/b/${slug}`;
    await copyToClipboard(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const activeCount = biosites.filter((b) => b.status === 'published').length;
  const soldBiosites = biosites.filter((b) => b.saleStatus === 'sold');
  const soldCount = soldBiosites.length;

  useEffect(() => {
    if (activeTab === 'inbox') {
      StorageService.fetchInbox().then(setInbox);
    }
  }, [activeTab]);

  const handleDockSelect = (tab: ActiveNavTab) => {
    if (tab === 'new') {
      onNavigate('/dashboard/biosites/new');
      return;
    }
    if (tab === 'settings') {
      onNavigate('/settings');
      return;
    }
    if (tab === 'biosites' || tab === 'manager' || tab === 'inbox' || tab === 'vendas') {
      setActiveTab(tab);
      window.history.pushState({}, '', tab === 'biosites' ? '/dashboard' : `/dashboard/${tab}`);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#F7F9FC] text-[#101828]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#EEF3F8] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <div
              onClick={() => {
                setActiveTab('biosites');
                onNavigate('/dashboard');
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <WorkfyLogo className="h-8 w-8" />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-[#0B1F3A]">
                  Workfy
                </span>
                <span className="text-[9px] font-bold text-[#155EEF] uppercase tracking-wider hidden sm:inline -mt-1">
                  Angola Pro
                </span>
              </div>
            </div>

            {/* MAIN NAVIGATION TABS */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-bold">
              {/* TAB 1: BIOSITES */}
              <button
                onClick={() => setActiveTab('biosites')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'biosites'
                    ? 'bg-[#155EEF] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#0B1F3A]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Meus Biosites</span>
              </button>

              {/* TAB 2: GERENCIADOR */}
              <button
                onClick={() => setActiveTab('manager')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'manager'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#0B1F3A]'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Gerenciador</span>
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'inbox' ? 'bg-[#155EEF] text-white shadow-xs' : 'text-[#667085] hover:text-[#0B1F3A]'
                }`}
              >
                <Inbox className="h-4 w-4" />
                <span>Leads & Reservas</span>
              </button>

            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs py-1.5 px-3 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]">
              <UserIcon className="h-3.5 w-3.5 text-[#155EEF]" />
              <span className="font-semibold truncate max-w-[120px]">{user.name}</span>
            </div>

            <button
              onClick={onLogout}
              title="Sair"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-rose-600 transition-colors p-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>

            <button
              onClick={() => onNavigate('/dashboard/biosites/new')}
              className="flex items-center gap-1.5 rounded-xl bg-[#155EEF] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Novo biosite</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE TOP TAB BAR */}
      <div className="md:hidden px-4 py-2 border-b border-[#EEF3F8] bg-white flex items-center justify-around gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('biosites')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
            activeTab === 'biosites' ? 'bg-[#155EEF] text-white' : 'text-[#667085]'
          }`}
        >
          Biosites
        </button>
        <button
          onClick={() => setActiveTab('manager')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeTab === 'manager' ? 'bg-emerald-600 text-white' : 'text-[#667085]'
          }`}
        >
          <span>Gerenciador</span>
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeTab === 'inbox' ? 'bg-[#155EEF] text-white' : 'text-[#667085]'
          }`}
        >
          <span>Leads</span>
        </button>
      </div>

      {/* MAIN BODY CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* BIOSITE MANAGER */}
        {(activeTab === 'manager' || activeTab === 'vendas') && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-[#EEF3F8]">
              <h1 className="text-xl font-black text-[#0B1F3A] tracking-tight flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#155EEF]" />
                <span>Gerenciador de Biosites</span>
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Acompanhe o estado, o progresso e a entrega de cada biosite.
              </p>
            </div>

            <BiositeManager
              biosites={biosites}
              onRefresh={reloadBiosites}
              onNavigate={onNavigate}
              onGoToFuturisticDashboard={() => setActiveTab('manager')}
            />
          </div>
        )}

        {activeTab === 'inbox' && (
          <InboxPanel inbox={inbox} biosites={biosites} onReload={() => StorageService.fetchInbox().then(setInbox)} />
        )}

        {/* VIEW 3: MEUS BIOSITES (GRID & TEMPLATES) */}
        {activeTab === 'biosites' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EEF3F8]">
              <div>
                <h1 className="text-xl font-extrabold text-[#0B1F3A] tracking-tight">
                  Meus biosites
                </h1>
                <p className="text-xs text-[#667085] mt-0.5">
                  Gerencie a presença digital, catálogo e métricas do seu negócio.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('manager')}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Abrir Gerenciador</span>
                </button>

                <button
                  onClick={() => onNavigate('/dashboard/biosites/new')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar biosite</span>
                </button>
              </div>
            </div>

            {/* EMPTY STATE */}
            {biosites.length === 0 ? (
              <div className="mt-12 rounded-2xl border border-dashed border-[#EEF3F8] bg-white p-12 text-center max-w-xl mx-auto shadow-2xs">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3F8] text-[#155EEF]">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#0B1F3A]">
                  Você ainda não criou seu primeiro biosite.
                </h3>
                <p className="mt-1.5 text-xs text-[#667085] leading-relaxed max-w-sm mx-auto">
                  Crie uma presença digital profissional com catálogo em Kz, WhatsApp, localização e QR Code em poucos minutos.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => onNavigate('/dashboard/biosites/new')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Criar meu biosite
                  </button>
                </div>
              </div>
            ) : (
              /* BIOSITES LIST */
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {biosites.map((b) => {
                  const publicUrl = `${window.location.origin}/b/${b.slug}`;
                  const isPublished = b.status === 'published';
                  const isSold = b.saleStatus === 'sold';
                  const salePrice = b.salePrice;
                  const soldPrice = b.soldPrice;

                  return (
                    <div
                      key={b.id}
                      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-2xs hover:shadow-xs transition-all ${
                        isSold ? 'border-emerald-300' : 'border-[#EEF3F8]'
                      }`}
                    >
                      <div>
                        {/* Top Row: Category & Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider">
                            {b.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isSold && (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black border border-emerald-300">
                                VENDIDO
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isPublished ? 'bg-emerald-600' : 'bg-amber-600'
                                }`}
                              />
                              {isPublished ? 'Publicado' : 'Rascunho'}
                            </span>
                          </div>
                        </div>

                        {/* Logo & Name */}
                        <div className="mt-4 flex items-center gap-3">
                          {b.logoUrl ? (
                            <img
                              src={b.logoUrl}
                              alt={b.name}
                              className="h-12 w-12 rounded-xl object-cover border border-[#EEF3F8] bg-slate-50"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#155EEF] text-white font-black text-base shadow-xs">
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-extrabold text-[#0B1F3A] truncate">
                              {b.name}
                            </h3>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs text-[#667085] truncate">
                                /b/{b.slug}
                              </span>
                              <button
                                onClick={() => handleCopyLink(b.slug)}
                                className="text-[#667085] hover:text-[#0B1F3A] p-0.5 cursor-pointer"
                                title="Copiar link"
                              >
                                {copiedSlug === b.slug ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {b.shortDescription && (
                          <p className="mt-3 text-xs text-[#667085] line-clamp-2 leading-relaxed">
                            {b.shortDescription}
                          </p>
                        )}

                      </div>

                      {/* Card Actions Bottom */}
                      <div className="mt-5 flex items-center gap-1.5 pt-4 border-t border-[#EEF3F8]">
                        <button
                          onClick={() => onNavigate(`/dashboard/biosites/${b.id}/editor`)}
                          className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-[#0B1F3A] hover:bg-[#155EEF] py-2 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </button>

                        {!isPublished && (
                          <button
                            onClick={() => {
                              StorageService.publishBiosite(b.id);
                              reloadBiosites();
                            }}
                            title="Publicar Biosite agora para produção"
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 px-2.5 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                          >
                            <Rocket className="h-3.5 w-3.5" />
                            <span>Publicar</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedQrBiosite(b)}
                          title="Ver QR Code"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                        >
                          <QrIcon className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigate(`/dashboard/biosites/${b.id}/analytics`)}
                          title="Analytics"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            const opened = openExternalUrl(publicUrl);
                            if (!opened) {
                              onNavigate(`/b/${b.slug}`);
                            }
                          }}
                          title="Abrir página pública"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#155EEF] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          title="Excluir biosite"
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE VENDA */}
      <SellBiositeModal
        biosite={selectedSellBiosite}
        isOpen={Boolean(selectedSellBiosite)}
        onClose={() => setSelectedSellBiosite(null)}
        onUpdated={() => reloadBiosites()}
        onGoToDashboard={() => setActiveTab('manager')}
      />

      {/* QR MODAL */}
      {selectedQrBiosite && (
        <QrCodeModal
          isOpen={!!selectedQrBiosite}
          onClose={() => setSelectedQrBiosite(null)}
          url={`${window.location.origin}/b/${selectedQrBiosite.slug}`}
          businessName={selectedQrBiosite.name}
        />
      )}

      {/* PERSISTENT BOTTOM NAVIGATION DOCK */}
      <BottomNavigation
        activeTab={activeTab === 'vendas' ? 'manager' : activeTab}
        onSelectTab={handleDockSelect}
        activeCount={activeCount}
        soldCount={soldCount}
      />
    </div>
  );
};

