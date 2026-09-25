import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ArrowLeft, User as UserIcon, Mail, Shield, Check } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onNavigate, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await StorageService.updateProfile(name.trim());
    } catch {
      window.alert('Não foi possível guardar. Tente novamente.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#101828]">
      <header className="sticky top-0 z-30 border-b border-[#EEF3F8] bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Painel</span>
            </button>
            <div className="h-4 w-[1px] bg-[#EEF3F8]" />
            <span className="text-sm font-bold text-[#0B1F3A]">Configurações da Conta</span>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Sair da conta
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-6 shadow-xs max-w-xl">
          <h2 className="text-base font-bold text-[#0B1F3A]">Seu Perfil</h2>
          <p className="text-xs text-[#667085] mt-0.5 mb-6">
            Gerencie suas credenciais de acesso à plataforma Workfy.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">E-mail</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-[#EEF3F8] bg-slate-100 py-2.5 px-3 text-xs text-[#667085] cursor-not-allowed"
              />
              <p className="text-[10px] text-[#667085] mt-1">
                O e-mail é o identificador único da sua conta.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-semibold">
                {saved && 'Alterações salvas com sucesso!'}
              </span>
              <button
                type="submit"
                className="rounded-xl bg-[#155EEF] px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
