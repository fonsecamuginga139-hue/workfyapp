import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { WorkfyLogo } from './WorkfyLogo';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onSuccess: (user: User) => void;
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (!password || password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await StorageService.signup(name.trim(), email.trim(), password);
        if (!user) {
          setInfo('Conta criada! Enviámos um link de confirmação para o seu e-mail. Confirme e depois faça login.');
          return;
        }
        onSuccess(user);
      } else {
        const user = await StorageService.login(email.trim(), password);
        onSuccess(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não conseguimos processar o acesso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <button
          onClick={() => onNavigate('/')}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para a página inicial
        </button>

        <div className="flex items-center gap-2.5">
          <WorkfyLogo className="h-9 w-9" />
          <span className="text-2xl font-black tracking-tight text-[#0B1F3A]">Workfy</span>
        </div>

        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#0B1F3A]">
          {mode === 'signup' ? 'Crie sua conta na Workfy' : 'Acesse seu painel'}
        </h2>
        <p className="mt-1 text-xs text-[#667085]">
          {mode === 'signup'
            ? 'Comece a construir a presença digital do seu negócio hoje.'
            : 'Gerencie seus biosites, catálogo e métricas.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-[#EEF3F8] bg-white p-6 sm:p-8 shadow-xs">
          {info && (
            <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
              {info}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Seu nome</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 pl-9 pr-3 text-xs text-[#0B1F3A] placeholder-[#667085] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">E-mail</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 pl-9 pr-3 text-xs text-[#0B1F3A] placeholder-[#667085] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Senha</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#667085]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 pl-9 pr-3 text-xs text-[#0B1F3A] placeholder-[#667085] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all disabled:opacity-60"
            >
              {loading ? (
                'Processando...'
              ) : mode === 'signup' ? (
                <>
                  Criar conta
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Entrar no Workfy
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#667085]">
            {mode === 'signup' ? (
              <>
                Já possui uma conta?{' '}
                <button
                  onClick={() => onNavigate('/login')}
                  className="font-bold text-[#155EEF] hover:underline"
                >
                  Faça login
                </button>
              </>
            ) : (
              <>
                Ainda não tem conta?{' '}
                <button
                  onClick={() => onNavigate('/signup')}
                  className="font-bold text-[#155EEF] hover:underline"
                >
                  Cadastre-se grátis
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
