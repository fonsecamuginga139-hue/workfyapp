import React, { useState } from 'react';
import { Biosite, BiositeSaleStatus } from '../types';
import { StorageService, formatKz } from '../services/storage';
import {
  X,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  User,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface SellBiositeModalProps {
  biosite: Biosite | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedBiosite: Biosite, markAsSold: boolean) => void;
  onGoToDashboard?: () => void;
}

export const SellBiositeModal: React.FC<SellBiositeModalProps> = ({
  biosite,
  isOpen,
  onClose,
  onUpdated,
  onGoToDashboard,
}) => {
  if (!isOpen || !biosite) return null;

  const [saleStatus, setSaleStatus] = useState<BiositeSaleStatus>(
    biosite.saleStatus || 'available'
  );
  const [salePriceInput, setSalePriceInput] = useState<string>(
    biosite.salePrice ? String(biosite.salePrice) : '120000'
  );
  const [soldPriceInput, setSoldPriceInput] = useState<string>(
    biosite.soldPrice ? String(biosite.soldPrice) : salePriceInput || '120000'
  );
  const [clientName, setClientName] = useState<string>(biosite.clientName || '');
  const [clientPhone, setClientPhone] = useState<string>(
    biosite.clientPhone || biosite.whatsappConfig?.phoneNumber || '+244 '
  );
  const [clientNotes, setClientNotes] = useState<string>(biosite.clientNotes || '');
  const [monthlyFeeInput, setMonthlyFeeInput] = useState<string>(
    biosite.monthlyFee ? String(biosite.monthlyFee) : '15000'
  );
  const [isSuccessSold, setIsSuccessSold] = useState(false);

  const handleSave = (asSoldDirectly: boolean = false) => {
    const finalSalePrice = Math.max(0, parseInt(salePriceInput.replace(/\D/g, '') || '0', 10));
    const finalSoldPrice = Math.max(0, parseInt(soldPriceInput.replace(/\D/g, '') || '0', 10));
    const finalMonthlyFee = Math.max(0, parseInt(monthlyFeeInput.replace(/\D/g, '') || '0', 10));

    if (asSoldDirectly || saleStatus === 'sold') {
      const updated = StorageService.markAsSold(biosite.id, {
        soldPrice: finalSoldPrice || finalSalePrice || 100000,
        clientName: clientName.trim() || 'Cliente Comercial',
        clientPhone: clientPhone.trim(),
        clientNotes: clientNotes.trim(),
        monthlyFee: finalMonthlyFee,
        soldDate: new Date().toISOString(),
      });

      if (updated) {
        setIsSuccessSold(true);
        onUpdated(updated, true);
      }
    } else {
      const updated = StorageService.updateSaleStatus(biosite.id, saleStatus, {
        salePrice: finalSalePrice,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientNotes: clientNotes.trim(),
        monthlyFee: finalMonthlyFee,
      });

      if (updated) {
        onUpdated(updated, false);
        onClose();
      }
    }
  };

  const parsedSalePrice = parseInt(salePriceInput.replace(/\D/g, '') || '0', 10);
  const parsedSoldPrice = parseInt(soldPriceInput.replace(/\D/g, '') || '0', 10);

  return (
    <div
      id="sell-biosite-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        id="sell-biosite-modal"
        className="relative w-full max-w-lg rounded-3xl border border-slate-700/50 bg-[#0B1222] p-6 text-white shadow-2xl"
      >
        {/* Top Glow Accent */}
        <div className="absolute -top-px left-12 right-12 h-px bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccessSold ? (
          /* CELEBRATORY SUCCESS STATE */
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)] mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Venda Concluída com Sucesso!
            </span>

            <h3 className="text-xl font-black text-white tracking-tight">
              {biosite.name} foi marcado como VENDIDO!
            </h3>

            <p className="mt-2 text-xs text-slate-300 max-w-sm mx-auto">
              Receita de{' '}
              <strong className="text-emerald-400 font-bold text-sm">
                {formatKz(parsedSoldPrice || parsedSalePrice)}
              </strong>{' '}
              registrada e injetada no fluxo do seu Dashboard Futurista.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose();
                  if (onGoToDashboard) onGoToDashboard();
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00F0FF] py-3 text-xs font-extrabold text-black hover:opacity-90 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <Zap className="h-4 w-4 fill-black" />
                <span>Ver no Dashboard Futurista</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Continuar Gerenciando
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#155EEF] to-[#00F0FF] text-white shadow-md">
                <DollarSign className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Definir Venda & Valor do Biosite
                </h3>
                <p className="text-xs text-slate-400">
                  {biosite.name} • /b/{biosite.slug}
                </p>
              </div>
            </div>

            {/* STATUS SELECTOR TABS */}
            <div className="mt-5 grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#070B14] border border-white/10">
              <button
                type="button"
                onClick={() => setSaleStatus('available')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  saleStatus === 'available'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Disponível
              </button>
              <button
                type="button"
                onClick={() => setSaleStatus('negotiating')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  saleStatus === 'negotiating'
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Negociando
              </button>
              <button
                type="button"
                onClick={() => setSaleStatus('sold')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  saleStatus === 'sold'
                    ? 'bg-emerald-500 text-black shadow-xs font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Vendido ✓
              </button>
              <button
                type="button"
                onClick={() => setSaleStatus('internal')}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  saleStatus === 'internal'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Próprio
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-left">
              {/* VALOR DA VENDA EM KZ */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Por quanto vai vender em conta? (Preço em Kz)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#00F0FF]">
                    Kz
                  </span>
                  <input
                    type="text"
                    value={saleStatus === 'sold' ? soldPriceInput : salePriceInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (saleStatus === 'sold') {
                        setSoldPriceInput(val);
                        setSalePriceInput(val);
                      } else {
                        setSalePriceInput(val);
                        setSoldPriceInput(val);
                      }
                    }}
                    placeholder="Ex: 150000"
                    className="w-full rounded-xl border border-white/10 bg-[#070B14] pl-12 pr-4 py-2.5 text-sm font-black text-white focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                    {formatKz(parsedSalePrice)}
                  </span>
                </div>
              </div>

              {/* CLIENTE & WHATSAPP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nome do Cliente / Comprador
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Manuel Silva"
                      className="w-full rounded-xl border border-white/10 bg-[#070B14] pl-9 pr-3 py-2 text-xs font-medium text-white focus:border-[#00F0FF] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    WhatsApp do Cliente
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+244 923 000 000"
                      className="w-full rounded-xl border border-white/10 bg-[#070B14] pl-9 pr-3 py-2 text-xs font-medium text-white focus:border-[#00F0FF] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* TAXA MENSAL OU NOTAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Manutenção Mensal (Opcional)
                  </label>
                  <input
                    type="text"
                    value={monthlyFeeInput}
                    onChange={(e) => setMonthlyFeeInput(e.target.value)}
                    placeholder="Ex: 15000 Kz/mês"
                    className="w-full rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 text-xs font-medium text-white focus:border-[#00F0FF] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Notas da Negociação
                  </label>
                  <input
                    type="text"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Ex: Pagamento 50% adiantado"
                    className="w-full rounded-xl border border-white/10 bg-[#070B14] px-3 py-2 text-xs font-medium text-white focus:border-[#00F0FF] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              {/* FAST "MARCAR COMO VENDIDO" BUTTON */}
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-[#00FF9D] py-3 text-xs font-black text-black hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.35)]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Marcar como VENDIDO Agora</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Salvar Valor & Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
