import React from 'react';
import {
  LayoutGrid,
  Activity,
  Inbox,
  DollarSign,
  Plus,
  Settings,
} from 'lucide-react';

export type ActiveNavTab = 'biosites' | 'manager' | 'inbox' | 'vendas' | 'new' | 'settings';

interface BottomNavigationProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  biositesCount?: number;
  activeCount?: number;
  soldCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  activeCount = 0,
  soldCount = 0,
}) => {
  return (
    <nav
      id="workfy-bottom-dock"
      aria-label="Navegação Principal"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg select-none"
    >
      <div className="relative flex items-center justify-around rounded-2xl border border-[#EEF3F8] bg-white/95 backdrop-blur-xl px-2.5 py-2 shadow-xl text-[#667085]">
        {/* Top subtle highlight */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#155EEF]/40 to-transparent pointer-events-none" />

        {/* 1. MEUS BIOSITES */}
        <button
          id="dock-tab-biosites"
          onClick={() => onSelectTab('biosites')}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all cursor-pointer ${
            activeTab === 'biosites'
              ? 'text-[#155EEF] font-bold'
              : 'hover:text-[#0B1F3A] text-[#667085]'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="h-5 w-5" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-black text-white">
                {activeCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Biosites</span>
          {activeTab === 'biosites' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-[#155EEF]" />
          )}
        </button>

        {/* 2. GERENCIADOR & PROGRESSO */}
        <button
          id="dock-tab-manager"
          onClick={() => onSelectTab('manager')}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all cursor-pointer ${
            activeTab === 'manager'
              ? 'text-emerald-600 font-bold'
              : 'hover:text-[#0B1F3A] text-[#667085]'
          }`}
        >
          <div className="relative">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-[10px] tracking-tight">Gerenciador</span>
          {activeTab === 'manager' && (
            <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-emerald-600" />
          )}
        </button>

        <button
          id="dock-tab-inbox"
          onClick={() => onSelectTab('inbox')}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all cursor-pointer ${
            activeTab === 'inbox' ? 'text-[#155EEF] font-bold' : 'hover:text-[#0B1F3A] text-[#667085]'
          }`}
        >
          <Inbox className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Leads</span>
          {activeTab === 'inbox' && <span className="absolute -bottom-1 h-1 w-5 rounded-full bg-[#155EEF]" />}
        </button>

        {/* 3. CRIAR NOVO (DESTAQUE CENTRAL) */}
        <button
          id="dock-tab-new"
          onClick={() => onSelectTab('new')}
          title="Criar novo biosite"
          className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#155EEF] text-white shadow-sm transition-all cursor-pointer border-2 border-white"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
          <span className="sr-only">Novo biosite</span>
        </button>


        {/* 5. CONFIGURAÇÕES / CONTA */}
        <button
          id="dock-tab-settings"
          onClick={() => onSelectTab('settings')}
          className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-[#0B1F3A] font-bold'
              : 'hover:text-[#0B1F3A] text-[#667085]'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Conta</span>
          {activeTab === 'settings' && (
            <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-[#0B1F3A]" />
          )}
        </button>
      </div>
    </nav>
  );
};

