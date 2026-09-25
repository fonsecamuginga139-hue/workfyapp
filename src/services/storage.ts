import { Biosite, User, BusinessCategory, DaySchedule, ThemePreset, ButtonStyle } from '../types';
import { THEME_PRESETS } from '../constants/themes';

const USERS_KEY = 'workfy_users';
const CURRENT_USER_KEY = 'workfy_current_user';
const BIOSITES_KEY = 'workfy_biosites';

export function formatKz(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0 Kz';
  return `${new Intl.NumberFormat('pt-AO', {
    maximumFractionDigits: 0,
  }).format(amount)} Kz`;
}

export function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  if (!phoneNumber) return '#';
  const clean = phoneNumber.replace(/[^\d]/g, '');
  const encodedMsg = encodeURIComponent(message || 'Olá! Gostaria de mais informações.');
  return `https://wa.me/${clean}?text=${encodedMsg}`;
}

const defaultDays: DaySchedule[] = [
  { day: 'Segunda-feira', hours: '08:00 - 19:00', isOpen: true },
  { day: 'Terça-feira', hours: '08:00 - 19:00', isOpen: true },
  { day: 'Quarta-feira', hours: '08:00 - 19:00', isOpen: true },
  { day: 'Quinta-feira', hours: '08:00 - 19:00', isOpen: true },
  { day: 'Sexta-feira', hours: '08:00 - 20:00', isOpen: true },
  { day: 'Sábado', hours: '08:00 - 18:00', isOpen: true },
  { day: 'Domingo', hours: 'Fechado', isOpen: false },
];

// Sample public showcase biosite for "Ver exemplo" (Barbearia Andrian in Luanda)
export const SAMPLE_BIOSITE_BARBEARIA: Biosite = {
  id: 'demo-barbearia-andrian',
  userId: 'demo-user',
  slug: 'barbearia-andrian',
  name: 'Barbearia Andrian',
  category: 'Barbearia',
  shortDescription: 'Cortes clássicos, barba na toalha quente e atendimento premium no coração de Luanda.',
  logoUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&auto=format&fit=crop&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1000&auto=format&fit=crop&q=80',
  status: 'published',
  viewsCount: 1420,

  // Commercial & Sales Management
  saleStatus: 'sold',
  salePrice: 150000,
  soldPrice: 150000,
  soldDate: '2026-09-14T15:30:00.000Z',
  clientName: 'Mário Andrian',
  clientPhone: '+244923456789',
  clientNotes: 'Cliente satisfeito, biosite entregue com catálogo e agendamento WhatsApp ativo.',
  monthlyFee: 15000,
  completionProgress: 100,

  appearance: {
    themePreset: 'obsidian',
    backgroundType: 'gradient',
    backgroundColor: '#090A0F',
    backgroundGradient: 'linear-gradient(160deg, #090A0F 0%, #151824 50%, #0F121C 100%)',
    cardBgColor: '#171B26',
    cardBorderColor: '#283044',
    cardBorderStyle: 'subtle',
    textColor: '#FFFFFF',
    textSecondaryColor: '#9CA3AF',
    accentColor: '#F59E0B',
    primaryColor: '#F59E0B',
    buttonBgColor: '#D97706',
    buttonTextColor: '#000000',
    buttonEffect: 'gradient',
    buttonGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    buttonStyle: 'rounded',
    catalogLayout: 'carousel',
    layout: 'standard',
  },
  sections: {
    profile: { enabled: true, showCover: true },
    actionButtons: { enabled: true },
    catalog: { enabled: true, title: 'Catálogo de Serviços', subtitle: 'Escolha seu estilo e agende com nossos mestres' },
    location: {
      enabled: true,
      address: 'Rua do Comércio, nº 42, Talatona',
      city: 'Luanda, Angola',
      reference: 'Próximo ao Belas Shopping',
      googleMapsUrl: 'https://maps.google.com/?q=Talatona,Luanda',
    },
    scheduleHours: {
      enabled: true,
      title: 'Horário de Atendimento',
      days: defaultDays,
    },
    appointment: {
      enabled: true,
      type: 'whatsapp',
      label: 'Agendar horário',
    },
    socialLinks: { enabled: true },
    about: {
      enabled: true,
      title: 'Sobre Nós',
      content: 'Fundada com o compromisso de resgatar a tradição da barbearia artesanal aliada às tendências contemporâneas. Ambiente climatizado, café expresso e profissionais especializados.',
    },
  },
  whatsappConfig: {
    phoneNumber: '+244923456789',
    defaultMessage: 'Olá! Gostaria de agendar um horário na Barbearia Andrian.',
    buttonLabel: 'Agendar no WhatsApp',
  },
  actionButtonsData: [
    { id: 'btn-1', type: 'whatsapp', label: 'Pedir pelo WhatsApp', value: '+244923456789', enabled: true },
    { id: 'btn-2', type: 'location', label: 'Como chegar (Mapa)', value: 'https://maps.google.com/?q=Talatona,Luanda', enabled: true },
    { id: 'btn-3', type: 'call', label: 'Ligar para a barbearia', value: '+244923456789', enabled: true },
  ],
  catalogCategories: [
    { id: 'cat-1', name: 'Cortes', order: 1 },
    { id: 'cat-2', name: 'Barba', order: 2 },
    { id: 'cat-3', name: 'Combos & Tratamentos', order: 3 },
  ],
  catalogItems: [
    {
      id: 'item-1',
      categoryId: 'cat-1',
      name: 'Corte Tradicional Masculino',
      description: 'Lavagem com produtos importados, corte personalizado à tesoura ou máquina e finalização com pomada matte.',
      price: 6000,
      imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80',
      isFeatured: true,
      ctaType: 'whatsapp',
      order: 1,
    },
    {
      id: 'item-2',
      categoryId: 'cat-1',
      name: 'Degradê / Fade Profissional',
      description: 'Acabamento em navalha com transição perfeita (low, mid ou high fade) e alinhamento de contorno.',
      price: 7500,
      imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&auto=format&fit=crop&q=80',
      isFeatured: false,
      ctaType: 'whatsapp',
      order: 2,
    },
    {
      id: 'item-3',
      categoryId: 'cat-2',
      name: 'Barba Terapia com Toalha Quente',
      description: 'Esfoliação suave, óleo emoliente, aplicação de toalha quente a vapor e desenho preciso com lâmina descartável.',
      price: 5000,
      imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80',
      isFeatured: true,
      ctaType: 'whatsapp',
      order: 3,
    },
    {
      id: 'item-4',
      categoryId: 'cat-3',
      name: 'Combo Completo Andrian (Corte + Barba)',
      description: 'Experiência completa com corte personalizado, barba terapia, hidratação capilar e massagem relaxante nos ombros.',
      price: 11000,
      imageUrl: 'https://images.unsplash.com/photo-1517832606589-7629c339590a?w=500&auto=format&fit=crop&q=80',
      isFeatured: true,
      ctaType: 'whatsapp',
      order: 4,
    },
  ],
  socialLinksData: {
    instagram: 'https://instagram.com/barbeariaandrian',
    facebook: 'https://facebook.com/barbeariaandrian',
    tiktok: 'https://tiktok.com/@barbeariaandrian',
  },
  analytics: {
    views: 1420,
    whatsappClicks: 342,
    callClicks: 89,
    locationClicks: 215,
    appointmentClicks: 290,
    productClicks: 412,
    recentEvents: [
      { id: 'ev-1', type: 'view', timestamp: '2026-09-19T08:15:00Z', label: 'Acesso via Instagram' },
      { id: 'ev-2', type: 'whatsapp', timestamp: '2026-09-19T08:30:00Z', label: 'Combo Completo Andrian' },
      { id: 'ev-3', type: 'location', timestamp: '2026-09-19T09:05:00Z', label: 'Como Chegar (Talatona)' },
    ],
  },
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-19T08:00:00Z',
};

// Additional quick demo references for the landing page segment selector
export const SAMPLE_BIOSITES: Record<string, Biosite> = {
  'barbearia-andrian': SAMPLE_BIOSITE_BARBEARIA,
  'restaurante-marginal': {
    ...SAMPLE_BIOSITE_BARBEARIA,
    id: 'demo-restaurante-marginal',
    slug: 'restaurante-marginal',
    name: 'Restaurante Marginal Luanda',
    category: 'Restaurante',
    shortDescription: 'Gastronomia marítima requintada, peixe fresco grelhado e vista deslumbrante para a Baía de Luanda.',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    catalogCategories: [
      { id: 'cat-r1', name: 'Entradas & Petiscos', order: 1 },
      { id: 'cat-r2', name: 'Pratos Principais', order: 2 },
    ],
    catalogItems: [
      {
        id: 'r-item-1',
        categoryId: 'cat-r1',
        name: 'Camarão ao Alho e Coentros',
        description: 'Camarão tigre salteado em azeite virgem extra, alho dourado e aroma de coentros frescos.',
        price: 9500,
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80',
        isFeatured: true,
        ctaType: 'whatsapp',
        order: 1,
      },
      {
        id: 'r-item-2',
        categoryId: 'cat-r2',
        name: 'Garoupa Fresca Grelhada',
        description: 'Acompanhada de batata a murro, legumes grelhados na brasa e molho de ervas finas.',
        price: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
        isFeatured: true,
        ctaType: 'whatsapp',
        order: 2,
      },
    ],
  },
};

export const INITIAL_SEED_BIOSITES: Biosite[] = [
  SAMPLE_BIOSITE_BARBEARIA,
  {
    ...SAMPLE_BIOSITE_BARBEARIA,
    id: 'demo-restaurante-marginal',
    userId: 'demo-user',
    slug: 'restaurante-marginal',
    name: 'Restaurante Marginal Luanda',
    category: 'Restaurante',
    shortDescription: 'Gastronomia marítima requintada, peixe fresco grelhado e vista deslumbrante para a Baía de Luanda.',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    viewsCount: 2890,
    saleStatus: 'sold',
    salePrice: 220000,
    soldPrice: 220000,
    soldDate: '2026-09-17T11:20:00.000Z',
    clientName: 'Carlos Pescador & Sócios',
    clientPhone: '+244923987654',
    clientNotes: 'Venda de biosite premium + integração WhatsApp para reservas de mesa.',
    monthlyFee: 20000,
    completionProgress: 100,
  },
  {
    ...SAMPLE_BIOSITE_BARBEARIA,
    id: 'demo-boutique-chic',
    userId: 'demo-user',
    slug: 'boutique-luanda-chic',
    name: 'Boutique Luanda Chic',
    category: 'Loja',
    shortDescription: 'Moda feminina executiva e vestidos de festa no Talatona Shopping.',
    logoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    viewsCount: 1640,
    saleStatus: 'negotiating',
    salePrice: 180000,
    clientName: 'Dra. Elsa Chic Monteiro',
    clientPhone: '+244912345678',
    clientNotes: 'Proposta de 180.000 Kz enviada. Cliente solicitou adicionar mais 4 vestidos no catálogo.',
    monthlyFee: 15000,
    completionProgress: 85,
  },
  {
    ...SAMPLE_BIOSITE_BARBEARIA,
    id: 'demo-clinica-prime',
    userId: 'demo-user',
    slug: 'clinica-sorriso-prime',
    name: 'Clínica Sorriso Prime',
    category: 'Clínica',
    shortDescription: 'Odontologia estética, ortodontia e implantes com equipamentos suíços.',
    logoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    viewsCount: 920,
    saleStatus: 'available',
    salePrice: 250000,
    clientNotes: 'Biosite modelo para clínicas odontológicas pronto para venda imediata.',
    monthlyFee: 25000,
    completionProgress: 75,
  },
  {
    ...SAMPLE_BIOSITE_BARBEARIA,
    id: 'demo-nexus-consultoria',
    userId: 'demo-user',
    slug: 'nexus-consultoria',
    name: 'Nexus Advocacia & Consultoria',
    category: 'Serviços',
    shortDescription: 'Assessoria jurídica corporativa, fiscal e regulatória para empresas em Angola.',
    status: 'draft',
    viewsCount: 180,
    saleStatus: 'negotiating',
    salePrice: 130000,
    clientName: 'Dr. Valdemar Costa',
    clientPhone: '+244933221100',
    clientNotes: 'Aguardando aprovação final da tabela de honorários e logotipo vetorizado.',
    monthlyFee: 20000,
    completionProgress: 55,
  },
];

export const StorageService = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  },

  login(email: string): User {
    const users = this.getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto register for seamless flow
      const name = email.split('@')[0] || 'Empreendedor';
      user = {
        id: `user-${Date.now()}`,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    this.setCurrentUser(user);
    return user;
  },

  signup(name: string, email: string): User {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  },

  logout() {
    this.setCurrentUser(null);
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getBiosites(userId?: string): Biosite[] {
    const raw = localStorage.getItem(BIOSITES_KEY);
    let list: Biosite[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    if (list.length === 0) {
      list = [...INITIAL_SEED_BIOSITES];
      localStorage.setItem(BIOSITES_KEY, JSON.stringify(list));
    }
    if (userId) {
      const userList = list.filter((b) => b.userId === userId);
      if (userList.length > 0) return userList;
      // If user has no specific biosites, share seeds with them
      return list;
    }
    return list;
  },

  getBiositeById(id: string): Biosite | null {
    if (id === 'demo-barbearia-andrian' || id === SAMPLE_BIOSITE_BARBEARIA.id) {
      return SAMPLE_BIOSITE_BARBEARIA;
    }
    const list = this.getBiosites();
    return list.find((b) => b.id === id) || null;
  },

  getBiositeBySlug(slug: string): Biosite | null {
    if (!slug) return null;
    let cleanSlug = slug.toLowerCase().trim();
    try {
      cleanSlug = decodeURIComponent(cleanSlug);
    } catch {
      // ignore decode error
    }
    cleanSlug = cleanSlug.replace(/\/+$/, '').trim();

    if (cleanSlug === 'barbearia-andrian') {
      return SAMPLE_BIOSITE_BARBEARIA;
    }
    if (SAMPLE_BIOSITES[cleanSlug]) {
      return SAMPLE_BIOSITES[cleanSlug];
    }

    const list = this.getBiosites();
    
    // 1. Direct exact slug match
    const exactMatch = list.find((b) => b.slug && b.slug.toLowerCase().trim() === cleanSlug);
    if (exactMatch) return exactMatch;

    // 2. Normalized match (without accents or hyphens)
    const normalizedTarget = cleanSlug
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const normMatch = list.find((b) => {
      if (!b.slug) return false;
      const bNorm = b.slug
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
      return bNorm === normalizedTarget;
    });
    if (normMatch) return normMatch;

    // 3. Fallback by ID in case ID was passed as slug
    const idMatch = list.find((b) => b.id === cleanSlug);
    if (idMatch) return idMatch;

    return null;
  },

  isSlugAvailable(slug: string, excludeId?: string): boolean {
    const cleanSlug = slug.toLowerCase().trim();
    if (cleanSlug === 'barbearia-andrian' && excludeId !== 'demo-barbearia-andrian') {
      return false;
    }
    const list = this.getBiosites();
    const found = list.find((b) => b.slug.toLowerCase() === cleanSlug);
    if (!found) return true;
    return found.id === excludeId;
  },

  /**
   * CRITICAL REQUIREMENT (Item 15):
   * "O primeiro biosite deve começar COMPLETAMENTE VAZIO.
   * Não criar automaticamente uma barbearia falsa.
   * Não preencher produtos falsos.
   * Não inventar endereço.
   * Não inventar telefone.
   * Não inventar preços.
   * O usuário deve construir tudo. Isso é fundamental."
   */
  createEmptyBiosite(
    userId: string,
    initial?: {
      name?: string;
      category?: BusinessCategory;
      shortDescription?: string;
      logoUrl?: string;
      coverUrl?: string;
      primaryColor?: string;
      themePreset?: ThemePreset;
      buttonStyle?: ButtonStyle;
    }
  ): Biosite {
    const baseName = initial?.name?.trim() || 'Meu Negócio';
    let baseSlug = baseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = 'meu-negocio';

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (!this.isSlugAvailable(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const presetId = initial?.themePreset || 'midnight';
    const preset = THEME_PRESETS[presetId] || THEME_PRESETS.midnight;

    const newBiosite: Biosite = {
      id: `bio-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      slug: finalSlug,
      name: initial?.name || '',
      category: initial?.category || 'Serviços',
      shortDescription: initial?.shortDescription || '',
      logoUrl: initial?.logoUrl || '',
      coverUrl: initial?.coverUrl || '',
      status: 'draft',
      viewsCount: 0,
      appearance: {
        themePreset: presetId,
        backgroundType: preset.backgroundType,
        backgroundColor: preset.backgroundColor,
        backgroundGradient: preset.backgroundGradient,
        cardBgColor: preset.cardBgColor,
        cardBorderColor: preset.cardBorderColor,
        cardBorderStyle: preset.cardBorderStyle,
        textColor: preset.textColor,
        textSecondaryColor: preset.textSecondaryColor,
        accentColor: preset.accentColor,
        primaryColor: initial?.primaryColor || preset.primaryColor,
        buttonBgColor: initial?.primaryColor || preset.buttonBgColor,
        buttonTextColor: preset.buttonTextColor,
        buttonEffect: preset.buttonEffect,
        buttonGradient: preset.buttonGradient,
        buttonStyle: initial?.buttonStyle || preset.buttonStyle,
        catalogLayout: preset.catalogLayout || 'list',
        layout: 'standard',
      },
      sections: {
        profile: { enabled: true, showCover: false },
        actionButtons: { enabled: false },
        catalog: { enabled: true, title: 'Catálogo', subtitle: '' },
        location: {
          enabled: false,
          address: '',
          city: '',
          reference: '',
          googleMapsUrl: '',
        },
        scheduleHours: {
          enabled: false,
          title: 'Horário de Funcionamento',
          days: defaultDays.map((d) => ({ ...d })),
        },
        appointment: {
          enabled: false,
          type: 'whatsapp',
          label: 'Agendar horário',
        },
        socialLinks: { enabled: false },
        about: {
          enabled: false,
          title: 'Sobre o Negócio',
          content: '',
        },
      },
      whatsappConfig: {
        phoneNumber: '',
        defaultMessage: 'Olá! Gostaria de mais informações.',
        buttonLabel: 'Falar no WhatsApp',
      },
      // COMPLETELY EMPTY AS SPECIFIED
      actionButtonsData: [],
      catalogCategories: [],
      catalogItems: [],
      socialLinksData: {},
      analytics: {
        views: 0,
        whatsappClicks: 0,
        callClicks: 0,
        locationClicks: 0,
        appointmentClicks: 0,
        productClicks: 0,
        recentEvents: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = this.getBiosites();
    list.unshift(newBiosite);
    localStorage.setItem(BIOSITES_KEY, JSON.stringify(list));
    return newBiosite;
  },

  updateBiosite(id: string, updates: Partial<Biosite>): Biosite | null {
    const list = this.getBiosites();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updated: Biosite = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    localStorage.setItem(BIOSITES_KEY, JSON.stringify(list));
    return updated;
  },

  publishBiosite(id: string): Biosite | null {
    return this.updateBiosite(id, { status: 'published' });
  },

  unpublishBiosite(id: string): Biosite | null {
    return this.updateBiosite(id, { status: 'draft' });
  },

  deleteBiosite(id: string): boolean {
    const list = this.getBiosites();
    const filtered = list.filter((b) => b.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(BIOSITES_KEY, JSON.stringify(filtered));
    return true;
  },

  trackEvent(
    slug: string,
    type: 'view' | 'whatsapp' | 'call' | 'location' | 'appointment' | 'product',
    label?: string
  ) {
    const biosite = this.getBiositeBySlug(slug);
    if (!biosite) return;

    const currentAnalytics = biosite.analytics || {
      views: 0,
      whatsappClicks: 0,
      callClicks: 0,
      locationClicks: 0,
      appointmentClicks: 0,
      productClicks: 0,
      recentEvents: [],
    };

    const updatedAnalytics = { ...currentAnalytics };
    if (type === 'view') updatedAnalytics.views += 1;
    if (type === 'whatsapp') updatedAnalytics.whatsappClicks += 1;
    if (type === 'call') updatedAnalytics.callClicks += 1;
    if (type === 'location') updatedAnalytics.locationClicks += 1;
    if (type === 'appointment') updatedAnalytics.appointmentClicks += 1;
    if (type === 'product') updatedAnalytics.productClicks += 1;

    const event = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      timestamp: new Date().toISOString(),
      label: label || '',
    };

    updatedAnalytics.recentEvents = [event, ...(updatedAnalytics.recentEvents || [])].slice(0, 30);

    if (biosite.id === SAMPLE_BIOSITE_BARBEARIA.id) {
      SAMPLE_BIOSITE_BARBEARIA.analytics = updatedAnalytics;
      return;
    }

    this.updateBiosite(biosite.id, {
      analytics: updatedAnalytics,
      viewsCount: updatedAnalytics.views,
    });
  },

  // Calculate detailed progress of a biosite (0 - 100%)
  calculateBiositeProgress(b: Biosite): {
    percentage: number;
    completedCount: number;
    totalCount: number;
    steps: Array<{ id: string; label: string; done: boolean; tip: string }>;
  } {
    const steps = [
      {
        id: 'identity',
        label: 'Nome & Descrição',
        done: Boolean(b.name && b.name.trim().length > 2 && b.shortDescription),
        tip: 'Identidade básica do negócio definida',
      },
      {
        id: 'logo',
        label: 'Logotipo ou Foto',
        done: Boolean(b.logoUrl && b.logoUrl.trim().length > 0),
        tip: 'Foto profissional ou logotipo adicionado',
      },
      {
        id: 'whatsapp',
        label: 'Canal WhatsApp Oficial',
        done: Boolean(b.whatsappConfig?.phoneNumber && b.whatsappConfig.phoneNumber.trim().length > 6),
        tip: 'Número com DDD/código do país para receber pedidos',
      },
      {
        id: 'catalog',
        label: 'Catálogo & Preços em Kz',
        done: Boolean(b.catalogItems && b.catalogItems.length >= 2),
        tip: 'Pelo menos 2 produtos ou serviços cadastrados',
      },
      {
        id: 'location',
        label: 'Localização ou Horário',
        done: Boolean(
          (b.sections?.location?.enabled && b.sections.location.address) ||
          b.sections?.scheduleHours?.enabled
        ),
        tip: 'Endereço físico em Luanda ou horário de funcionamento',
      },
      {
        id: 'published',
        label: 'Publicado no Ar',
        done: b.status === 'published',
        tip: 'Página ativa na URL pública /b/:slug',
      },
    ];

    const completedCount = steps.filter((s) => s.done).length;
    const totalCount = steps.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return { percentage, completedCount, totalCount, steps };
  },

  // Define selling price for biosite
  setSalePrice(id: string, salePrice: number): Biosite | null {
    return this.updateBiosite(id, { salePrice });
  },

  // Mark biosite as sold
  markAsSold(
    id: string,
    details: {
      soldPrice: number;
      clientName: string;
      clientPhone?: string;
      soldDate?: string;
      clientNotes?: string;
      monthlyFee?: number;
    }
  ): Biosite | null {
    const biosite = this.getBiositeById(id);
    if (!biosite) return null;

    const soldDate = details.soldDate || new Date().toISOString();
    return this.updateBiosite(id, {
      saleStatus: 'sold',
      soldPrice: details.soldPrice,
      salePrice: details.soldPrice,
      clientName: details.clientName,
      clientPhone: details.clientPhone || biosite.clientPhone,
      clientNotes: details.clientNotes || biosite.clientNotes,
      monthlyFee: details.monthlyFee ?? biosite.monthlyFee,
      soldDate,
      status: 'published', // sold biosites are active
    });
  },

  // Update sale status (available, negotiating, sold, internal)
  updateSaleStatus(
    id: string,
    saleStatus: 'available' | 'negotiating' | 'sold' | 'internal',
    extra?: Partial<Biosite>
  ): Biosite | null {
    return this.updateBiosite(id, {
      saleStatus,
      ...(extra || {}),
    });
  },

  // Get commercial metrics for futuristic dashboard
  getCommercialMetrics(userId?: string) {
    const biosites = this.getBiosites(userId);

    const soldBiosites = biosites.filter((b) => b.saleStatus === 'sold');
    const negotiatingBiosites = biosites.filter((b) => b.saleStatus === 'negotiating');
    const availableBiosites = biosites.filter((b) => b.saleStatus === 'available' || !b.saleStatus);
    const internalBiosites = biosites.filter((b) => b.saleStatus === 'internal');

    const totalSoldKz = soldBiosites.reduce((sum, b) => sum + (b.soldPrice || b.salePrice || 0), 0);
    const pipelineKz = negotiatingBiosites.reduce((sum, b) => sum + (b.salePrice || 0), 0);
    const availablePotentialKz = availableBiosites.reduce((sum, b) => sum + (b.salePrice || 0), 0);
    const monthlyRecurringKz = soldBiosites.reduce((sum, b) => sum + (b.monthlyFee || 0), 0);

    const publishedCount = biosites.filter((b) => b.status === 'published').length;
    const draftCount = biosites.filter((b) => b.status === 'draft').length;
    const totalViews = biosites.reduce((sum, b) => sum + (b.viewsCount || 0), 0);
    const totalWhatsappClicks = biosites.reduce(
      (sum, b) => sum + (b.analytics?.whatsappClicks || 0),
      0
    );

    const averageTicketKz = soldBiosites.length > 0 ? Math.round(totalSoldKz / soldBiosites.length) : 0;
    const conversionRate = biosites.length > 0 ? Math.round((soldBiosites.length / biosites.length) * 100) : 0;

    // Timeline data for futuristic graph
    // Sort sold biosites by soldDate
    const sortedSold = [...soldBiosites].sort(
      (a, b) => new Date(a.soldDate || a.updatedAt).getTime() - new Date(b.soldDate || b.updatedAt).getTime()
    );

    let cumulativeRevenue = 0;
    const salesEvents = sortedSold.map((b) => {
      const price = b.soldPrice || b.salePrice || 0;
      cumulativeRevenue += price;
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        clientName: b.clientName || 'Cliente Anônimo',
        clientPhone: b.clientPhone || '',
        price,
        cumulativeRevenue,
        date: b.soldDate || b.updatedAt,
        category: b.category,
      };
    });

    return {
      biosites,
      soldBiosites,
      negotiatingBiosites,
      availableBiosites,
      internalBiosites,
      totalSoldKz,
      pipelineKz,
      availablePotentialKz,
      monthlyRecurringKz,
      publishedCount,
      draftCount,
      totalViews,
      totalWhatsappClicks,
      averageTicketKz,
      conversionRate,
      salesEvents,
    };
  },
};
