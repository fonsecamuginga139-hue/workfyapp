import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Share2,
  QrCode as QrIcon,
  Globe,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Music2,
  Sparkles,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import { Biosite, CatalogItem } from '../types';
import { formatKz, generateWhatsAppLink } from '../services/storage';
import { THEME_PRESETS } from '../constants/themes';
import { PublicLeadForm } from './PublicLeadForm';

export function formatSocialUrl(url?: string, platform?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Handle @handle or raw handles
  if (platform === 'tiktok') {
    const clean = trimmed.replace(/^@/, '');
    return `https://www.tiktok.com/@${clean}`;
  }
  if (platform === 'instagram') {
    const clean = trimmed.replace(/^@/, '');
    return `https://www.instagram.com/${clean}`;
  }
  if (platform === 'twitter') {
    const clean = trimmed.replace(/^@/, '');
    return `https://x.com/${clean}`;
  }
  if (platform === 'youtube') {
    const clean = trimmed.replace(/^@/, '');
    return `https://www.youtube.com/@${clean}`;
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/${trimmed}`;
  }
  if (platform === 'linkedin') {
    if (trimmed.startsWith('in/')) return `https://www.linkedin.com/${trimmed}`;
    return `https://www.linkedin.com/in/${trimmed}`;
  }

  return `https://${trimmed}`;
}

interface BiositeViewerProps {
  biosite: Biosite;
  isSimulator?: boolean;
  onOpenQrCode?: () => void;
  onTrackAction?: (
    type: 'whatsapp' | 'call' | 'location' | 'appointment' | 'product',
    label?: string
  ) => void;
}

export const BiositeViewer: React.FC<BiositeViewerProps> = ({
  biosite,
  isSimulator = false,
  onOpenQrCode,
  onTrackAction,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [shareNotice, setShareNotice] = useState(false);

  const {
    name,
    category,
    shortDescription,
    logoUrl,
    coverUrl,
    appearance,
    sections,
    whatsappConfig,
    catalogCategories,
    catalogItems,
    socialLinksData,
  } = biosite;

  // Resolve theme defaults
  const presetKey = appearance?.themePreset || 'classic';
  const defaultTheme = THEME_PRESETS[presetKey] || THEME_PRESETS.classic;

  const bgType = appearance?.backgroundType || defaultTheme.backgroundType;
  const bgColor = appearance?.backgroundColor || defaultTheme.backgroundColor;
  const bgGradient = appearance?.backgroundGradient || defaultTheme.backgroundGradient;

  const cardBgColor = appearance?.cardBgColor || defaultTheme.cardBgColor;
  const cardBorderColor = appearance?.cardBorderColor || defaultTheme.cardBorderColor;
  const cardBorderStyle = appearance?.cardBorderStyle || defaultTheme.cardBorderStyle;

  const textColor = appearance?.textColor || defaultTheme.textColor;
  const textSecondaryColor = appearance?.textSecondaryColor || defaultTheme.textSecondaryColor;
  const accentColor = appearance?.accentColor || defaultTheme.accentColor;

  const primaryColor = appearance?.primaryColor || defaultTheme.primaryColor;
  const buttonBgColor = appearance?.buttonBgColor || primaryColor;
  const buttonTextColor = appearance?.buttonTextColor || defaultTheme.buttonTextColor;
  const buttonEffect = appearance?.buttonEffect || defaultTheme.buttonEffect;
  const buttonGradient = appearance?.buttonGradient || defaultTheme.buttonGradient;
  const buttonStyle = appearance?.buttonStyle || defaultTheme.buttonStyle;
  const catalogLayout = appearance?.catalogLayout || defaultTheme.catalogLayout || 'list';

  // Computed background style
  const containerBgStyle: React.CSSProperties = {
    background: bgType === 'gradient' ? bgGradient : bgColor,
  };

  // Border class based on style
  const getCardBorderClass = () => {
    if (cardBorderStyle === 'none') return 'border-transparent';
    if (cardBorderStyle === 'prominent') return 'border-2';
    return 'border';
  };

  // Button radius class
  const getButtonRadiusClass = () => {
    if (buttonStyle === 'pill') return 'rounded-full';
    if (buttonStyle === 'square') return 'rounded-none';
    return 'rounded-xl';
  };

  const cardBorderClass = getCardBorderClass();
  const radiusClass = getButtonRadiusClass();

  // CTA Button style helper
  const getPrimaryButtonStyle = (): React.CSSProperties => {
    if (buttonEffect === 'outline') {
      return {
        backgroundColor: 'transparent',
        border: `1.5px solid ${buttonBgColor}`,
        color: buttonBgColor,
      };
    }
    if (buttonEffect === 'gradient') {
      return {
        background: buttonGradient || `linear-gradient(135deg, ${buttonBgColor} 0%, #155EEF 100%)`,
        color: buttonTextColor,
      };
    }
    return {
      backgroundColor: buttonBgColor,
      color: buttonTextColor,
    };
  };

  const getSecondaryButtonStyle = (): React.CSSProperties => {
    return {
      backgroundColor: cardBgColor,
      borderColor: cardBorderColor,
      color: textColor,
    };
  };

  const handleShare = async () => {
    const url = window.location.origin + `/b/${biosite.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: biosite.name || 'Workfy Biosite',
          text: biosite.shortDescription || 'Conheça nosso negócio no Workfy',
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(url);
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2200);
  };

  // Filter catalog items
  const filteredItems = catalogItems.filter((item) => {
    if (selectedCategoryId === 'all') return true;
    return item.categoryId === selectedCategoryId;
  });

  const handleProductWhatsApp = (item: CatalogItem) => {
    onTrackAction?.('product', item.name);
    const msg = `Olá! Tenho interesse em *${item.name}* (${formatKz(item.price)}). Poderia me passar mais informações?`;
    const link = generateWhatsAppLink(whatsappConfig.phoneNumber, msg);
    window.open(link, '_blank');
  };

  const handleGeneralWhatsApp = () => {
    onTrackAction?.('whatsapp', 'Botão Principal');
    const link = generateWhatsAppLink(whatsappConfig.phoneNumber, whatsappConfig.defaultMessage);
    window.open(link, '_blank');
  };

  const handleLocationClick = () => {
    onTrackAction?.('location', 'Como chegar');
    if (sections.location.googleMapsUrl) {
      window.open(sections.location.googleMapsUrl, '_blank');
    } else {
      const q = encodeURIComponent(`${sections.location.address}, ${sections.location.city}`);
      window.open(`https://maps.google.com/?q=${q}`, '_blank');
    }
  };

  const handleCallClick = (phone: string) => {
    onTrackAction?.('call', phone);
    window.open(`tel:${phone.replace(/[^\d+]/g, '')}`, '_self');
  };

  const handleAppointmentClick = () => {
    onTrackAction?.('appointment', 'Agendamento');
    if (sections.appointment.type === 'whatsapp') {
      const msg = `Olá! Gostaria de agendar um horário com ${name || 'vocês'}.`;
      const link = generateWhatsAppLink(whatsappConfig.phoneNumber, msg);
      window.open(link, '_blank');
    } else if (sections.appointment.externalUrl) {
      window.open(sections.appointment.externalUrl, '_blank');
    }
  };

  const hasSocials = Boolean(
    socialLinksData?.instagram?.trim() ||
    socialLinksData?.tiktok?.trim() ||
    socialLinksData?.facebook?.trim() ||
    socialLinksData?.youtube?.trim() ||
    socialLinksData?.linkedin?.trim() ||
    socialLinksData?.twitter?.trim() ||
    socialLinksData?.website?.trim()
  );

  return (
    <div
      style={containerBgStyle}
      className={`relative w-full overflow-x-hidden transition-colors ${
        isSimulator ? 'h-full overflow-y-auto' : 'min-h-screen'
      }`}
    >
      <div
        style={containerBgStyle}
        className={`mx-auto w-full transition-all min-h-screen ${
          isSimulator
            ? 'max-w-full'
            : 'max-w-[440px] shadow-2xl border-x'
        }`}
      >
        {/* DRAFT MODE NOTICE (PÚBLICO) */}
        {biosite.status === 'draft' && !isSimulator && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-slate-950" />
              <span>Modo Rascunho (Prévia) • Este biosite ainda não foi publicado em produção</span>
            </span>
          </div>
        )}
        {/* TOP FLOATING ACTION BAR */}
        <div
          style={{
            backgroundColor: cardBgColor,
            borderColor: cardBorderColor,
          }}
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 backdrop-blur-md border-b bg-opacity-90"
        >
          <span
            style={{ color: textSecondaryColor }}
            className="text-xs font-semibold tracking-wide uppercase truncate max-w-[180px]"
          >
            {category || 'Negócio'}
          </span>

          <div className="flex items-center gap-1.5">
            {onOpenQrCode && (
              <button
                onClick={onOpenQrCode}
                title="Ver QR Code"
                style={{ color: textSecondaryColor, borderColor: cardBorderColor }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
              >
                <QrIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleShare}
              title="Compartilhar"
              style={{ color: textSecondaryColor, borderColor: cardBorderColor }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {shareNotice && (
          <div className="bg-emerald-900/80 text-emerald-200 text-xs py-1.5 px-4 text-center font-medium border-b border-emerald-700 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Link copiado com sucesso!
          </div>
        )}

        {/* PROFILE COVER */}
        {sections.profile?.showCover && coverUrl && (
          <div className="relative h-36 sm:h-40 w-full overflow-hidden">
            <img
              src={coverUrl}
              alt="Capa do negócio"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        {/* PROFILE HEADER & IDENTITY */}
        <div className="px-4 pt-4 pb-5">
          <div className="flex flex-col items-center text-center">
            {logoUrl ? (
              <div
                style={{ borderColor: cardBorderColor, backgroundColor: cardBgColor }}
                className={`relative overflow-hidden rounded-full border-2 shadow-md ${
                  sections.profile?.showCover && coverUrl ? '-mt-14' : 'mt-0'
                } h-20 w-20 shrink-0`}
              >
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div
                style={{
                  borderColor: cardBorderColor,
                  backgroundColor: cardBgColor,
                  color: primaryColor,
                }}
                className={`flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-md text-xl font-bold ${
                  sections.profile?.showCover && coverUrl ? '-mt-14' : 'mt-0'
                }`}
              >
                {name ? name.substring(0, 2).toUpperCase() : 'WF'}
              </div>
            )}

            <h1
              style={{ color: textColor }}
              className="mt-3 text-lg font-bold tracking-tight px-2"
            >
              {name || 'Nome do Negócio'}
            </h1>

            {shortDescription && (
              <p
                style={{ color: textSecondaryColor }}
                className="mt-1.5 text-xs max-w-xs leading-relaxed"
              >
                {shortDescription}
              </p>
            )}
          </div>

          {/* QUICK SOCIAL ICONS */}
          {hasSocials && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {socialLinksData.instagram && (
                <a
                  href={formatSocialUrl(socialLinksData.instagram, 'instagram')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.tiktok && (
                <a
                  href={formatSocialUrl(socialLinksData.tiktok, 'tiktok')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="TikTok"
                  aria-label="TikTok"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Music2 className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.facebook && (
                <a
                  href={formatSocialUrl(socialLinksData.facebook, 'facebook')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  aria-label="Facebook"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.youtube && (
                <a
                  href={formatSocialUrl(socialLinksData.youtube, 'youtube')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                  aria-label="YouTube"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.linkedin && (
                <a
                  href={formatSocialUrl(socialLinksData.linkedin, 'linkedin')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.twitter && (
                <a
                  href={formatSocialUrl(socialLinksData.twitter, 'twitter')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Twitter / X"
                  aria-label="Twitter / X"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinksData.website && (
                <a
                  href={formatSocialUrl(socialLinksData.website, 'website')}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Website Oficial"
                  aria-label="Website Oficial"
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardBorderColor,
                    color: textSecondaryColor,
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border hover:opacity-80 transition-all hover:scale-110"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {/* PRIMARY ACTION BUTTONS */}
          <div className="mt-4 flex flex-col gap-2">
            {whatsappConfig.phoneNumber && (
              <button
                onClick={handleGeneralWhatsApp}
                style={getPrimaryButtonStyle()}
                className={`w-full py-3 px-4 font-bold text-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 ${radiusClass}`}
              >
                <MessageCircle className="h-4 w-4 shrink-0 fill-current/20" />
                <span>{whatsappConfig.buttonLabel || 'Falar no WhatsApp'}</span>
              </button>
            )}

            {/* Configured action buttons */}
            {sections.actionButtons?.enabled &&
              biosite.actionButtonsData?.map((btn) => {
                if (!btn.enabled) return null;
                return (
                  <button
                    key={btn.id}
                    onClick={() => {
                      if (btn.type === 'call') handleCallClick(btn.value);
                      if (btn.type === 'location') handleLocationClick();
                      if (btn.type === 'appointment') handleAppointmentClick();
                      if (btn.type === 'whatsapp') {
                        const link = generateWhatsAppLink(
                          btn.value,
                          whatsappConfig.defaultMessage
                        );
                        window.open(link, '_blank');
                      }
                      if (btn.type === 'website') window.open(btn.value, '_blank');
                    }}
                    style={getSecondaryButtonStyle()}
                    className={`w-full py-2.5 px-4 ${cardBorderClass} font-semibold text-xs transition-all flex items-center justify-center gap-2 hover:opacity-85 ${radiusClass}`}
                  >
                    {btn.type === 'call' && <Phone className="h-3.5 w-3.5" style={{ color: accentColor }} />}
                    {btn.type === 'location' && <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />}
                    {btn.type === 'appointment' && <Calendar className="h-3.5 w-3.5" style={{ color: accentColor }} />}
                    {btn.type === 'website' && <ExternalLink className="h-3.5 w-3.5" style={{ color: accentColor }} />}
                    <span>{btn.label}</span>
                  </button>
                );
              })}

            {sections.appointment?.enabled && (
              <button
                onClick={handleAppointmentClick}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
                className={`w-full py-2.5 px-4 border font-semibold text-xs hover:opacity-85 transition-all flex items-center justify-center gap-2 ${radiusClass}`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>{sections.appointment.label || 'Agendar horário'}</span>
              </button>
            )}
          </div>
        </div>

        {/* CATALOG SECTION */}
        {sections.catalog?.enabled && (
          <div
            style={{ borderColor: cardBorderColor }}
            className="border-t px-4 py-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2
                  style={{ color: textColor }}
                  className="text-sm font-bold tracking-tight"
                >
                  {sections.catalog.title || 'Catálogo de Produtos & Serviços'}
                </h2>
                {sections.catalog.subtitle && (
                  <p
                    style={{ color: textSecondaryColor }}
                    className="text-[11px] mt-0.5"
                  >
                    {sections.catalog.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Category tabs */}
            {catalogCategories.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-2.5 scrollbar-none mb-3">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  style={{
                    backgroundColor: selectedCategoryId === 'all' ? primaryColor : cardBgColor,
                    color: selectedCategoryId === 'all' ? buttonTextColor : textSecondaryColor,
                    borderColor: cardBorderColor,
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors`}
                >
                  Todos ({catalogItems.length})
                </button>
                {catalogCategories.map((cat) => {
                  const count = catalogItems.filter((i) => i.categoryId === cat.id).length;
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      style={{
                        backgroundColor: isSelected ? primaryColor : cardBgColor,
                        color: isSelected ? buttonTextColor : textSecondaryColor,
                        borderColor: cardBorderColor,
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors`}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Catalog Items Layouts */}
            {filteredItems.length === 0 ? (
              <div
                style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}
                className={`rounded-xl border border-dashed p-6 text-center`}
              >
                <p style={{ color: textSecondaryColor }} className="text-xs font-medium">
                  {catalogItems.length === 0
                    ? 'Seu catálogo está vazio. Adicione seus primeiros produtos ou serviços.'
                    : 'Nenhum item nesta categoria.'}
                </p>
              </div>
            ) : (
              <div>
                {/* 1. LAYOUT HORIZONTAL / CARROSSEL EM UMA LINHA DESLIZÁVEL */}
                {catalogLayout === 'carousel' && (
                  <div className="relative">
                    <div className="flex gap-3 overflow-x-auto snap-x pb-3 pt-1 scrollbar-none">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: cardBgColor,
                            borderColor: cardBorderColor,
                          }}
                          className={`w-56 shrink-0 snap-start rounded-xl ${cardBorderClass} p-3 shadow-md flex flex-col justify-between transition-all`}
                        >
                          <div>
                            {item.imageUrl ? (
                              <div className="relative h-32 w-full overflow-hidden rounded-lg mb-2.5">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                {item.isFeatured && (
                                  <span
                                    style={{ backgroundColor: accentColor, color: '#000' }}
                                    className="absolute top-1.5 left-1.5 flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs"
                                  >
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Destaque
                                  </span>
                                )}
                              </div>
                            ) : null}

                            <h3
                              style={{ color: textColor }}
                              className="text-xs font-bold leading-tight line-clamp-1"
                            >
                              {item.name}
                            </h3>

                            {item.description && (
                              <p
                                style={{ color: textSecondaryColor }}
                                className="mt-1 text-[11px] line-clamp-2 leading-relaxed"
                              >
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t" style={{ borderColor: cardBorderColor }}>
                            <div className="flex items-center justify-between mb-2">
                              <span
                                style={{ color: accentColor }}
                                className="text-xs font-extrabold"
                              >
                                {formatKz(item.price)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleProductWhatsApp(item)}
                              style={getPrimaryButtonStyle()}
                              className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold transition-opacity hover:opacity-90 ${radiusClass}`}
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>Pedir</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p style={{ color: textSecondaryColor }} className="text-[10px] text-center mt-1 flex items-center justify-center gap-1 opacity-70">
                      <span>Deslize para o lado para ver mais produtos</span>
                      <ChevronRight className="h-3 w-3" />
                    </p>
                  </div>
                )}

                {/* 2. LAYOUT GRADE / GRID EM 2 COLUNAS */}
                {catalogLayout === 'grid' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: cardBgColor,
                          borderColor: cardBorderColor,
                        }}
                        className={`rounded-xl ${cardBorderClass} p-2.5 shadow-md flex flex-col justify-between transition-all`}
                      >
                        <div>
                          {item.imageUrl && (
                            <div className="relative h-28 w-full overflow-hidden rounded-lg mb-2">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {item.isFeatured && (
                                <span
                                  style={{ backgroundColor: accentColor, color: '#000' }}
                                  className="absolute top-1 left-1 flex items-center gap-0.5 text-[8px] font-extrabold px-1 py-0.5 rounded shadow-xs"
                                >
                                  <Sparkles className="h-2 w-2" />
                                  Top
                                </span>
                              )}
                            </div>
                          )}

                          <h3
                            style={{ color: textColor }}
                            className="text-xs font-bold leading-tight line-clamp-1"
                          >
                            {item.name}
                          </h3>

                          {item.description && (
                            <p
                              style={{ color: textSecondaryColor }}
                              className="mt-0.5 text-[10px] line-clamp-2 leading-tight"
                            >
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-2 pt-1.5 border-t" style={{ borderColor: cardBorderColor }}>
                          <span
                            style={{ color: accentColor }}
                            className="block text-xs font-extrabold mb-1.5"
                          >
                            {formatKz(item.price)}
                          </span>

                          <button
                            onClick={() => handleProductWhatsApp(item)}
                            style={getPrimaryButtonStyle()}
                            className={`w-full flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-semibold transition-opacity hover:opacity-90 ${radiusClass}`}
                          >
                            <MessageCircle className="h-2.5 w-2.5" />
                            <span>Pedir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. LAYOUT CARDS EXPANDIDOS / VITRINE GRANDE */}
                {catalogLayout === 'cards' && (
                  <div className="flex flex-col gap-3.5">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: cardBgColor,
                          borderColor: cardBorderColor,
                        }}
                        className={`rounded-xl ${cardBorderClass} overflow-hidden shadow-lg transition-all`}
                      >
                        {item.imageUrl && (
                          <div className="relative h-44 w-full overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {item.isFeatured && (
                              <span
                                style={{ backgroundColor: accentColor, color: '#000' }}
                                className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md"
                              >
                                <Sparkles className="h-3 w-3" />
                                Destaque Especial
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              style={{ color: textColor }}
                              className="text-sm font-bold leading-tight"
                            >
                              {item.name}
                            </h3>
                            <span
                              style={{ color: accentColor }}
                              className="text-sm font-extrabold whitespace-nowrap"
                            >
                              {formatKz(item.price)}
                            </span>
                          </div>

                          {item.description && (
                            <p
                              style={{ color: textSecondaryColor }}
                              className="mt-1.5 text-xs leading-relaxed"
                            >
                              {item.description}
                            </p>
                          )}

                          <div className="mt-3.5 pt-2.5 border-t" style={{ borderColor: cardBorderColor }}>
                            <button
                              onClick={() => handleProductWhatsApp(item)}
                              style={getPrimaryButtonStyle()}
                              className={`w-full py-2.5 px-4 text-xs font-bold shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 ${radiusClass}`}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>Pedir pelo WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. LAYOUT PADRÃO (LISTA HORIZONTAL DE ITENS) */}
                {catalogLayout === 'list' && (
                  <div className="flex flex-col gap-2.5">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: cardBgColor,
                          borderColor: cardBorderColor,
                        }}
                        className={`flex gap-3 rounded-xl ${cardBorderClass} p-3 shadow-md hover:opacity-95 transition-all`}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-20 w-20 rounded-lg object-cover bg-slate-900/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h3
                                style={{ color: textColor }}
                                className="text-xs font-bold leading-tight"
                              >
                                {item.name}
                              </h3>
                              {item.isFeatured && (
                                <span
                                  style={{ backgroundColor: accentColor, color: '#000' }}
                                  className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                                >
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Destaque
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p
                                style={{ color: textSecondaryColor }}
                                className="mt-1 text-[11px] line-clamp-2 leading-relaxed"
                              >
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div
                            style={{ borderColor: cardBorderColor }}
                            className="mt-2.5 flex items-center justify-between pt-1 border-t"
                          >
                            <span
                              style={{ color: accentColor }}
                              className="text-xs font-extrabold"
                            >
                              {formatKz(item.price)}
                            </span>

                            <button
                              onClick={() => handleProductWhatsApp(item)}
                              style={getPrimaryButtonStyle()}
                              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold shadow-xs hover:opacity-90 transition-opacity ${radiusClass}`}
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>
                                {item.ctaType === 'appointment'
                                  ? 'Agendar'
                                  : item.ctaType === 'info'
                                  ? 'Informações'
                                  : 'Pedir'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LOCATION & ADDRESS */}
        {sections.location?.enabled && (sections.location.address || sections.location.city) && (
          <div
            style={{ borderColor: cardBorderColor }}
            className="border-t px-4 py-5"
          >
            <h2
              style={{ color: textColor }}
              className="text-xs font-bold flex items-center gap-1.5 mb-2"
            >
              <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />
              Localização
            </h2>
            <div
              style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}
              className={`rounded-xl ${cardBorderClass} p-3 shadow-md`}
            >
              <p style={{ color: textColor }} className="text-xs font-semibold">
                {sections.location.address}
              </p>
              <p style={{ color: textSecondaryColor }} className="text-[11px] mt-0.5">
                {sections.location.city}
              </p>
              {sections.location.reference && (
                <p style={{ color: textSecondaryColor }} className="text-[10px] italic mt-1">
                  Ponto de referência: {sections.location.reference}
                </p>
              )}

              <button
                onClick={handleLocationClick}
                style={getSecondaryButtonStyle()}
                className={`mt-3 w-full flex items-center justify-center gap-1.5 ${cardBorderClass} py-2 text-xs font-semibold hover:opacity-85 transition-opacity ${radiusClass}`}
              >
                <MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />
                Como chegar no Google Maps
              </button>
            </div>
          </div>
        )}

        {/* WORKING HOURS */}
        {sections.scheduleHours?.enabled && sections.scheduleHours.days && (
          <div
            style={{ borderColor: cardBorderColor }}
            className="border-t px-4 py-5"
          >
            <h2
              style={{ color: textColor }}
              className="text-xs font-bold flex items-center gap-1.5 mb-2.5"
            >
              <Clock className="h-3.5 w-3.5" style={{ color: accentColor }} />
              {sections.scheduleHours.title || 'Horário de Atendimento'}
            </h2>
            <div
              style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}
              className={`rounded-xl ${cardBorderClass} divide-y shadow-md`}
            >
              {sections.scheduleHours.days.map((sched, idx) => (
                <div
                  key={idx}
                  style={{ borderColor: cardBorderColor }}
                  className="flex items-center justify-between px-3 py-2 text-[11px]"
                >
                  <span style={{ color: textSecondaryColor }} className="font-medium">
                    {sched.day}
                  </span>
                  <span
                    style={{
                      color: sched.isOpen ? textColor : '#EF4444',
                    }}
                    className="font-semibold"
                  >
                    {sched.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT US SECTION */}
        {sections.about?.enabled && sections.about.content && (
          <div
            style={{ borderColor: cardBorderColor }}
            className="border-t px-4 py-5"
          >
            <h2 style={{ color: textColor }} className="text-xs font-bold mb-1.5">
              {sections.about.title || 'Sobre Nós'}
            </h2>
            <p
              style={{ color: textSecondaryColor }}
              className="text-xs leading-relaxed whitespace-pre-line"
            >
              {sections.about.content}
            </p>
          </div>
        )}

        {(biosite.servicesData || []).filter((service) => service.available).length > 0 && (
          <section className="px-4 py-6 space-y-3" aria-label="Serviços disponíveis">
            <h2 className="text-base font-bold" style={{ color: textColor }}>Serviços</h2>
            {(biosite.servicesData || []).filter((service) => service.available).map((service) => (
              <div key={service.id} className="border p-4 space-y-2 rounded-lg" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor, color: textColor }}>
                {service.mediaUrl && (service.mediaType === 'video' ? <video controls preload="none" playsInline className="w-full rounded-lg" src={service.mediaUrl} /> : <img loading="lazy" className="w-full rounded-lg object-cover" src={service.mediaUrl} alt={service.name} />)}
                <strong className="block">{service.name}</strong>
                {service.description && <p className="text-xs opacity-75">{service.description}</p>}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">{service.promotionalPrice != null ? formatKz(service.promotionalPrice) : service.price != null ? formatKz(service.price) : ''}</span>
                  {service.ctaType === 'whatsapp' && whatsappConfig.phoneNumber && <a href={generateWhatsAppLink(whatsappConfig.phoneNumber, `Olá! Gostaria de saber mais sobre ${service.name}.`)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold underline">{service.ctaLabel}</a>}
                </div>
              </div>
            ))}
          </section>
        )}
        {(biosite.formsData || []).filter((form) => form.enabled).map((form) => (
          <div key={form.id} className="px-4 py-3"><PublicLeadForm form={form} slug={biosite.slug} color={buttonBgColor} cardColor={cardBgColor} textColor={textColor} /></div>
        ))}
        {(biosite.blocks || []).filter((block) => block.enabled).map((block) => (
          <section key={block.id} className="px-4 py-4" style={{ color: textColor }}>
            {block.type === 'text' && <p className="whitespace-pre-wrap">{String(block.content.text || '')}</p>}
            {block.type === 'image' && typeof block.content.url === 'string' && <img loading="lazy" className="w-full rounded-lg" src={block.content.url} alt={String(block.content.alt || '')} />}
            {block.type === 'video' && typeof block.content.url === 'string' && <video controls preload="none" playsInline className="w-full rounded-lg" src={block.content.url} />}
            {block.type === 'music' && typeof block.content.url === 'string' && /^https:\/\/open\.spotify\.com\/(track|album|playlist)\/[\w]+/.test(block.content.url) && <iframe title="Spotify" loading="lazy" src={block.content.url.replace('open.spotify.com/', 'open.spotify.com/embed/')} className="w-full h-40 border-0" />}
            {block.type === 'spacer' && <div style={{ height: block.size === 'large' ? 64 : block.size === 'compact' ? 16 : 32 }} />}
          </section>
        ))}

        {/* FOOTER BRANDING */}
        <div
          style={{ borderColor: cardBorderColor, backgroundColor: cardBgColor }}
          className="border-t py-6 px-4 text-center mt-4"
        >
          <a
            href="/"
            onClick={(e) => {
              if (isSimulator) {
                e.preventDefault();
              }
            }}
            style={{ color: textSecondaryColor }}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium hover:opacity-90 transition-opacity"
          >
            <span>Feito com</span>
            <span style={{ color: textColor }} className="font-bold tracking-tight">
              Workfy
            </span>
          </a>
          <p
            style={{ color: textSecondaryColor }}
            className="text-[9px] opacity-70 mt-1"
          >
            Presença digital profissional para negócios
          </p>
        </div>
      </div>
    </div>
  );
};
