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
