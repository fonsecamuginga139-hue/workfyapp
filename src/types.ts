export type BusinessCategory =
  | 'Restaurante'
  | 'Barbearia'
  | 'Salão'
  | 'Loja'
  | 'Clínica'
  | 'Hotel'
  | 'Profissional'
  | 'Serviços'
  | 'Outro';

export type ThemePreset =
  | 'midnight'
  | 'obsidian'
  | 'violet'
  | 'emerald'
  | 'sunset'
  | 'sapphire'
  | 'slate'
  | 'nude'
  | 'custom'
  | 'minimal'
  | 'classic'
  | 'modern'
  | 'elegant';

export type ButtonStyle = 'rounded' | 'pill' | 'square';

export type ButtonEffect = 'solid' | 'gradient' | 'outline';

export type CardBorderStyle = 'none' | 'subtle' | 'prominent';

export type CatalogLayout = 'list' | 'grid' | 'carousel' | 'cards';

export type BackgroundType = 'solid' | 'gradient';

export type BiositeLayout = 'standard' | 'compact' | 'hero';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  order: number;
}

export interface CatalogItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // In Kz (Angolan Kwanza)
  imageUrl?: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  promotionalPrice?: number;
  badge?: string;
  available?: boolean;
  ctaLabel?: string;
  isFeatured?: boolean;
  ctaType: 'whatsapp' | 'appointment' | 'info';
  order: number;
}

export type BiositeBlockType = 'hero' | 'text' | 'image' | 'video' | 'buttons' | 'music' | 'form' | 'services' | 'spacer';

export interface BiositeBlock {
  id: string;
  biositeId: string;
  ownerId: string;
  type: BiositeBlockType;
  position: number;
  enabled: boolean;
  size: 'compact' | 'standard' | 'large';
  content: Record<string, unknown>;
  appearance: Record<string, unknown>;
}

export interface BiositeService {
  id: string;
  biositeId: string;
  name: string;
  description: string;
  price?: number;
  promotionalPrice?: number;
  durationMinutes?: number;
  mediaType: 'image' | 'video';
  mediaUrl?: string;
  ctaType: 'booking' | 'whatsapp' | 'info';
  ctaLabel: string;
  featured: boolean;
  available: boolean;
  position: number;
}

export interface BiositeFormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  label: string;
  required: boolean;
}

export interface BiositeForm {
  id: string;
  biositeId: string;
  title: string;
  description: string;
  submitLabel: string;
  fields: BiositeFormField[];
  enabled: boolean;
  position: number;
}

export interface ActionButton {
  id: string;
  type: 'whatsapp' | 'call' | 'location' | 'appointment' | 'website';
  label: string;
  value: string;
  enabled: boolean;
}

export interface DaySchedule {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface AnalyticsData {
  views: number;
  whatsappClicks: number;
  callClicks: number;
  locationClicks: number;
  appointmentClicks: number;
  productClicks: number;
  recentEvents: Array<{
    id: string;
    type: 'view' | 'whatsapp' | 'call' | 'location' | 'appointment' | 'product';
    timestamp: string;
    label?: string;
  }>;
}

export type BiositeSaleStatus = 'available' | 'negotiating' | 'sold' | 'internal';

export interface Biosite {
  id: string;
  userId: string;
  slug: string;
  name: string;
  category: BusinessCategory;
  shortDescription: string;
  logoUrl?: string;
  coverUrl?: string;
  status: 'draft' | 'published';
  viewsCount: number;
  showcaseOptIn?: boolean;
  showcasedAt?: string;
  seo?: { title?: string; description?: string; shareImageUrl?: string };
  branding?: { enabled?: boolean; text?: string };
  blocks?: BiositeBlock[];
  servicesData?: BiositeService[];
  formsData?: BiositeForm[];

  // Commercial & Sales Management (Follow de Vendas & Progresso)
  saleStatus?: BiositeSaleStatus; // 'available' | 'negotiating' | 'sold' | 'internal'
  salePrice?: number; // Preço estipulado de venda em Kz (ex: 120.000)
  soldPrice?: number; // Preço final efetivo da venda em Kz
  soldDate?: string; // Data ISO da venda
  clientName?: string; // Nome do comprador / cliente
  clientPhone?: string; // WhatsApp do comprador
  clientNotes?: string; // Observações da negociação
  monthlyFee?: number; // Manutenção mensal em Kz
  completionProgress?: number; // 0 - 100%

  appearance: {
    themePreset: ThemePreset;
    primaryColor: string; // e.g. #155EEF
    buttonStyle: ButtonStyle;
    layout: BiositeLayout;
    fontFamily?: string;

    // Advanced colors & gradients
    backgroundType?: BackgroundType;
    backgroundColor?: string;
    backgroundGradient?: string;
    
    // Cards & blocks
    cardBgColor?: string;
    cardBorderColor?: string;
    cardBorderStyle?: CardBorderStyle;

    // Typography
    textColor?: string;
    textSecondaryColor?: string;
    accentColor?: string;

    // Button customization
    buttonBgColor?: string;
    buttonTextColor?: string;
    buttonEffect?: ButtonEffect;
    buttonGradient?: string;

    // Catalog display format
    catalogLayout?: CatalogLayout;
  };

  sections: {
    profile: { enabled: boolean; showCover: boolean };
    actionButtons: { enabled: boolean };
    catalog: { enabled: boolean; title: string; subtitle?: string };
    location: {
      enabled: boolean;
      address: string;
      city: string;
      reference?: string;
      googleMapsUrl?: string;
    };
    scheduleHours: {
      enabled: boolean;
      title: string;
      days: DaySchedule[];
    };
    appointment: {
      enabled: boolean;
      type: 'whatsapp' | 'external';
      externalUrl?: string;
      label?: string;
    };
    socialLinks: { enabled: boolean };
    about: {
      enabled: boolean;
      title: string;
      content: string;
    };
  };

  whatsappConfig: {
    phoneNumber: string; // e.g. +244 923 112 233
    defaultMessage: string;
    buttonLabel: string;
  };

  actionButtonsData: ActionButton[];
  catalogCategories: CatalogCategory[];
  catalogItems: CatalogItem[];

  socialLinksData: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  analytics: AnalyticsData;
  createdAt: string;
  updatedAt: string;
}
