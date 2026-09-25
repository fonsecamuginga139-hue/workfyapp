import React, { useState } from 'react';
import { BusinessCategory, ThemePreset, ButtonStyle } from '../types';
import { StorageService } from '../services/storage';
import { ImageUploader } from './ImageUploader';
import { THEME_PRESETS } from '../constants/themes';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Upload,
  Palette,
  Check,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingNewBiositeProps {
  userId: string;
  onFinished: (newBiositeId: string) => void;
  onCancel: () => void;
}

const CATEGORIES: BusinessCategory[] = [
  'Restaurante',
  'Barbearia',
  'Salão',
  'Loja',
  'Clínica',
  'Hotel',
  'Profissional',
  'Serviços',
  'Outro',
];

const PRESETS: Array<{ id: ThemePreset; name: string; desc: string; color: string; btn: ButtonStyle }> = [
  { id: 'modern', name: 'Modern', desc: 'Tipografia nítida, cantos arredondados suaves e azul Workfy.', color: '#155EEF', btn: 'rounded' },
  { id: 'minimal', name: 'Minimal', desc: 'Espaço generoso, estética limpa e foco total no produto.', color: '#0B1F3A', btn: 'rounded' },
  { id: 'classic', name: 'Classic', desc: 'Estrutura tradicional, formal e de alta credibilidade corporativa.', color: '#1F2937', btn: 'square' },
  { id: 'elegant', name: 'Elegant', desc: 'Acabamentos refinados, botões arredondados e contraste sutil.', color: '#1E40AF', btn: 'pill' },
];

const COLOR_OPTIONS = [
  { label: 'Azul Workfy', hex: '#155EEF' },
  { label: 'Azul Marinho', hex: '#0B1F3A' },
  { label: 'Grafite', hex: '#1F2937' },
  { label: 'Esmeralda', hex: '#059669' },
  { label: 'Vinho', hex: '#881337' },
  { label: 'Âmbar', hex: '#D97706' },
];

export const OnboardingNewBiosite: React.FC<OnboardingNewBiositeProps> = ({
  userId,
  onFinished,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Negócio
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Serviços');
  const [shortDescription, setShortDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 2: Aparência
  const [themePreset, setThemePreset] = useState<ThemePreset>('midnight');
  const [primaryColor, setPrimaryColor] = useState('#38BDF8');
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>('rounded');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (presetId: ThemePreset) => {
    setThemePreset(presetId);
    const found = THEME_PRESETS[presetId];
    if (found) {
      setPrimaryColor(found.primaryColor);
      setButtonStyle(found.buttonStyle);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do seu negócio.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      // Create completely empty biosite as mandated by Item 15
      const newBio = StorageService.createEmptyBiosite(userId, {
        name: name.trim(),
        category,
        shortDescription: shortDescription.trim(),
        logoUrl: logoUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        themePreset,
        primaryColor,
        buttonStyle,
      });

      setLoading(false);
      onFinished(newBio.id);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* TOP BAR / PROGRESS */}
        <div className="flex items-center justify-between pb-6 border-b border-[#EEF3F8]">
          <button
            onClick={step === 2 ? () => setStep(1) : onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 2 ? 'Voltar para Negócio' : 'Cancelar'}
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 1 ? 'bg-[#155EEF] text-white' : 'bg-[#EEF3F8] text-[#0B1F3A]'
              }`}
            >
              1
            </span>
            <span className="h-0.5 w-6 bg-[#EEF3F8]" />
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                step === 2 ? 'bg-[#155EEF] text-white' : 'bg-[#EEF3F8] text-[#667085]'
              }`}
            >
              2
            </span>
          </div>
        </div>

        {/* STEP 1: SEU NEGÓCIO */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="mt-8 rounded-2xl bg-white p-6 sm:p-8 border border-[#EEF3F8] shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF]">
                Etapa 1 de 2
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-[#0B1F3A] tracking-tight">
                Seu Negócio
              </h1>
              <p className="mt-1 text-xs text-[#667085]">
                Diga-nos o nome e segmento do seu estabelecimento.
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                  Nome do negócio *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pastelaria Luanda, Barbearia Andrian, Dra. Joana..."
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 px-3.5 text-xs text-[#0B1F3A] placeholder-[#667085] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                  Categoria do negócio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl py-2 px-3 text-xs font-semibold border transition-all text-left ${
                        category === cat
                          ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#0B1F3A] hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                  Descrição curta
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Ex: Especialistas em cortes clássicos e barboterapia no Talatona."
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 px-3.5 text-xs text-[#0B1F3A] placeholder-[#667085] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all resize-none"
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-[#EEF3F8]">
                <ImageUploader
                  label="Logo ou Foto de Perfil (opcional)"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  description="Carregue da sua galeria (PNG, JPG, WEBP) ou cole o link direto."
                  aspectRatio="square"
                  maxDimension={800}
                  placeholderUrl="https://exemplo.com/logo.jpg"
                />

                <ImageUploader
                  label="Foto de Capa do Perfil (opcional)"
                  value={coverUrl}
                  onChange={setCoverUrl}
                  description="Banner superior para dar destaque à sua marca."
                  aspectRatio="wide"
                  maxDimension={1200}
                  placeholderUrl="https://exemplo.com/capa.jpg"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[#155EEF] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all"
              >
                Continuar para Aparência
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: APARÊNCIA */}
        {step === 2 && (
          <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8 border border-[#EEF3F8] shadow-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF]">
                Etapa 2 de 2
              </span>
              <h1 className="mt-1 text-2xl font-extrabold text-[#0B1F3A] tracking-tight">
                Aparência & Estilo
              </h1>
              <p className="mt-1 text-xs text-[#667085]">
                Escolha o visual que melhor representa a identidade do seu negócio.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                  Temas & Paletas Prontas (Especiais Não-Brancas)
                </label>
                <p className="text-[11px] text-[#667085] mb-2.5">
                  Estilos completos com fundos em degradê suave, cards estilizados e botões elegantes.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(THEME_PRESETS).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between ${
                        themePreset === p.id
                          ? 'border-[#155EEF] bg-blue-50/40 shadow-xs ring-1 ring-[#155EEF]'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-[#0B1F3A]">{p.name}</h4>
                        {themePreset === p.id && (
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#155EEF] bg-blue-100 px-1.5 py-0.2 rounded">
                            <Check className="h-3 w-3" /> Selecionado
                          </span>
                        )}
                      </div>

                      {/* Visual swatch */}
                      <div
                        style={{ background: p.backgroundGradient }}
                        className="h-8 w-full rounded-lg border border-white/10 p-1 flex items-center justify-between shadow-inner mb-2 overflow-hidden"
                      >
                        <div
                          style={{ backgroundColor: p.cardBgColor, borderColor: p.cardBorderColor }}
                          className="h-full px-2 rounded flex items-center border text-[9px] font-bold"
                        >
                          <span style={{ color: p.textColor }}>Card</span>
                        </div>
                        <div
                          style={{ backgroundColor: p.buttonBgColor, color: p.buttonTextColor }}
                          className="h-4 px-2 rounded-full flex items-center text-[8px] font-bold shadow-xs"
                        >
                          Botão
                        </div>
                      </div>

                      <p className="text-[10px] text-[#667085] leading-relaxed line-clamp-2">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cor Principal */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-2">
                  Cor Principal de Ação
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                        primaryColor === c.hex
                          ? 'border-[#155EEF] bg-white shadow-2xs text-[#0B1F3A]'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085] hover:bg-slate-100'
                      }`}
                    >
                      <span
                        style={{ backgroundColor: c.hex }}
                        className="h-3.5 w-3.5 rounded-full border border-black/10"
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formato dos Botões */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-2">
                  Formato dos Botões
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rounded', label: 'Arredondado', shape: 'rounded-xl' },
                    { id: 'pill', label: 'Pílula', shape: 'rounded-full' },
                    { id: 'square', label: 'Reto', shape: 'rounded-none' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setButtonStyle(btn.id as ButtonStyle)}
                      className={`py-3 px-2 border text-center transition-all ${btn.shape} ${
                        buttonStyle === btn.id
                          ? 'border-[#155EEF] bg-blue-50 text-[#155EEF] font-bold'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085] hover:bg-white text-xs'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-4 border-t border-[#EEF3F8]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#667085] hover:text-[#0B1F3A]"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="flex items-center gap-2 rounded-xl bg-[#155EEF] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all disabled:opacity-60"
              >
                {loading ? (
                  'Criando biosite vazio...'
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Criar Biosite e Abrir Editor
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
