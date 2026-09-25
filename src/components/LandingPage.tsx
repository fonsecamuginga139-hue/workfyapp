import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  QrCode as QrIcon,
  ChevronRight,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { SAMPLE_BIOSITE_BARBEARIA } from '../services/storage';
import { BiositeViewer } from './BiositeViewer';
import { QrCodeModal } from './QrCodeModal';
import { WorkfyLogo } from './WorkfyLogo';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

const FULL_HERO_TITLE = 'Seu negócio merece mais do que um link na bio.';
const HIGHLIGHT_START = 'Seu negócio merece mais do que '.length; // 31

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Smooth typing effect specifically for "Seu negócio merece mais do que um link na bio."
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (charCount < FULL_HERO_TITLE.length) {
        // Natural smooth typing cadence
        const char = FULL_HERO_TITLE[charCount];
        const delay = char === ' ' ? 85 : char === '.' ? 140 : 55;
        timeout = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, delay);
      } else {
        // Full phrase pause (5 seconds of clear readability)
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 5000);
      }
    } else {
      if (charCount > 0) {
        // Smooth rewinding
        timeout = setTimeout(() => {
          setCharCount((prev) => prev - 1);
        }, 25);
      } else {
        // Brief pause before retyping
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 700);
      }
    }

    return () => clearTimeout(timeout);
  }, [charCount, isDeleting]);

  const currentTyped = FULL_HERO_TITLE.slice(0, charCount);
  const prefixTyped = currentTyped.slice(0, HIGHLIGHT_START);
  const highlightTyped = charCount > HIGHLIGHT_START ? currentTyped.slice(HIGHLIGHT_START) : '';

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#101828]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#EEF3F8] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <WorkfyLogo className="h-9 w-9" />
            <span className="text-xl font-black tracking-tight text-[#0B1F3A]">Workfy</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/b/barbearia-andrian')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] transition-colors px-3 py-2"
            >
              Ver Exemplo Real
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="text-xs font-semibold text-[#0B1F3A] hover:text-[#155EEF] px-3.5 py-2 transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#124bbf] transition-all"
            >
              Começar agora
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EEF3F8] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B1F3A] shadow-2xs mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#155EEF] animate-pulse" />
            <span>Presença digital completa para o seu negócio</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B1F3A] sm:text-5xl sm:leading-[1.15] max-w-3xl mx-auto min-h-[72px] sm:min-h-[110px] flex items-center justify-center flex-wrap">
            <span>{prefixTyped}</span>
            {highlightTyped && (
              <span className="text-[#155EEF] ml-1.5">{highlightTyped}</span>
            )}
            <span
              className="inline-block w-[3px] sm:w-[4px] h-[0.85em] bg-[#155EEF] rounded-full ml-1 animate-pulse align-middle"
              aria-hidden="true"
            />
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-[#667085] sm:text-lg leading-relaxed">
            Crie uma página profissional para apresentar seus produtos, serviços, localização e
            canais de atendimento em um único lugar.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('/b/barbearia-andrian')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#EEF3F8] bg-white px-6 py-3.5 text-sm font-semibold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-all"
            >
              Ver exemplo real
            </button>
          </div>

          <p className="mt-3 text-xs text-[#667085]">
            Crie do zero. Personalize. Publique.
          </p>

          {/* REAL MOCKUP OF WORKFY BIOSITE IN SMARTPHONE */}
          <div className="mt-14 sm:mt-16 flex justify-center">
            <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[390px] rounded-[44px] border-[10px] border-[#0B1F3A] bg-white shadow-2xl p-0.5 overflow-hidden">
              {/* Speaker notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 h-4 w-28 rounded-full bg-[#0B1F3A]" />

              <div className="h-[640px] w-full overflow-y-auto pt-6 scrollbar-none">
                <BiositeViewer
                  biosite={SAMPLE_BIOSITE_BARBEARIA}
                  isSimulator={true}
                  onOpenQrCode={() => setShowQrModal(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT VALUE / EVERYTHING YOUR CLIENT NEEDS */}
      <section className="border-t border-[#EEF3F8] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
              Tudo o que seu cliente precisa. Em um só lugar.
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Uma experiência completa projetada para transformar visitantes em clientes reais.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">WhatsApp Integrado</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Mensagens pré-configuradas para produtos e atendimento instantâneo.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Catálogo & Categorias</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Apresente itens, fotos e preços organizados em Kwanza (Kz).
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Localização & Rota</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Endereço claro e botão direto para abrir no Google Maps.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Agendamento Rápido</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Conecte seu link de agendamento ou receba pedidos de horário no WhatsApp.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <QrIcon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">QR Code do Negócio</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Gere e imprima o QR Code para colocar nas mesas, balcão ou cartão.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#155EEF] shadow-2xs mb-3">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-[#0B1F3A]">Link Único Profissional</h3>
              <p className="mt-1 text-xs text-[#667085] leading-relaxed">
                Sua URL personalizada workfy.app/b/seu-negocio para divulgar em todo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (ONLY 3 STEPS) */}
      <section className="py-16 sm:py-24 border-t border-[#EEF3F8]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
              Do zero ao ar em poucos minutos.
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Simples, direto e sem complexidade desnecessária.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-6 border border-[#EEF3F8] shadow-2xs">
              <span className="text-3xl font-black text-[#155EEF]">01</span>
              <h3 className="mt-3 text-base font-bold text-[#0B1F3A]">Crie</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Comece seu biosite do zero. Defina o nome, categoria e a proposta do seu negócio.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-[#EEF3F8] shadow-2xs">
              <span className="text-3xl font-black text-[#155EEF]">02</span>
              <h3 className="mt-3 text-base font-bold text-[#0B1F3A]">Personalize</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Adicione sua identidade, serviços, produtos em Kz, horário e canais de contato.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 border border-[#EEF3F8] shadow-2xs">
              <span className="text-3xl font-black text-[#155EEF]">03</span>
              <h3 className="mt-3 text-base font-bold text-[#0B1F3A]">Publique</h3>
              <p className="mt-2 text-xs text-[#667085] leading-relaxed">
                Compartilhe seu link e transforme seu QR Code em uma porta de entrada para o seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENT EXAMPLES */}
      <section className="border-t border-[#EEF3F8] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
              Feito para qualquer tipo de negócio.
            </h2>
            <p className="mt-2 text-sm text-[#667085]">
              Escolha seu segmento e veja como o Workfy adapta sua vitrine.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { title: 'Barbearia', desc: 'Cortes, barbas e agendamento direto', slug: 'barbearia-andrian' },
              { title: 'Restaurante', desc: 'Cardápio digital com fotos e pedidos', slug: 'restaurante-marginal' },
              { title: 'Salão de Beleza', desc: 'Penteados, estética e manicure', slug: 'barbearia-andrian' },
              { title: 'Loja & Boutique', desc: 'Catálogo de roupas, calçados e acessórios', slug: 'barbearia-andrian' },
              { title: 'Profissional', desc: 'Consultores, advogados e médicos', slug: 'barbearia-andrian' },
              { title: 'Serviços Locais', desc: 'Oficinas, lavanderias e entregas', slug: 'barbearia-andrian' },
            ].map((seg, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-[#EEF3F8] bg-[#F7F9FC] p-5 hover:border-[#155EEF]/30 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F3A]">{seg.title}</h3>
                  <p className="mt-1 text-xs text-[#667085] leading-relaxed">{seg.desc}</p>
                </div>
                <button
                  onClick={() => onNavigate(`/b/${seg.slug}`)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#155EEF] hover:text-[#124bbf]"
                >
                  Ver exemplo
                  <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="border-t border-[#EEF3F8] py-16 sm:py-20 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
            Dê ao seu negócio um lugar para chamar de seu na internet.
          </h2>
          <p className="mt-3 text-sm text-[#667085]">
            Pronto para criar a presença digital do seu negócio?
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => onNavigate('/signup')}
              className="rounded-xl bg-[#155EEF] px-8 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-[#124bbf] transition-all flex items-center gap-2"
            >
              Criar meu biosite
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#EEF3F8] bg-white py-8">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 text-xs text-[#667085]">
          <div className="flex items-center gap-2">
            <WorkfyLogo className="h-6 w-6" />
            <span className="font-bold text-[#0B1F3A]">Workfy</span>
            <span>— Presença digital profissional</span>
          </div>
          <div>© {new Date().getFullYear()} Workfy. Todos os direitos reservados.</div>
        </div>
      </footer>

      {/* QR CODE MODAL FOR SAMPLE */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={window.location.origin + '/b/barbearia-andrian'}
        businessName="Barbearia Andrian"
      />
    </div>
  );
};
