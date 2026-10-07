import { Biosite, User, BusinessCategory, DaySchedule, ThemePreset, ButtonStyle, BiositeBlock, BiositeService, BiositeForm } from '../types';
import { THEME_PRESETS } from '../constants/themes';
import { supabase } from '../integrations/supabase/client';


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

type Row = Record<string, any>;

const emptyAnalytics = () => ({
  views: 0,
  whatsappClicks: 0,
  callClicks: 0,
  locationClicks: 0,
  appointmentClicks: 0,
  productClicks: 0,
  recentEvents: [] as Biosite['analytics']['recentEvents'],
});

function rowToBiosite(r: Row): Biosite {
  return {
    id: r.id,
    userId: r.user_id || '',
    slug: r.slug,
    name: r.name || '',
    category: (r.category || 'Serviços') as BusinessCategory,
    shortDescription: r.short_description || '',
    logoUrl: r.logo_url || '',
    coverUrl: r.cover_url || '',
    status: r.status === 'published' ? 'published' : 'draft',
    viewsCount: r.views_count || 0,
    showcaseOptIn: Boolean(r.showcase_opt_in),
    showcasedAt: r.showcased_at || undefined,
    seo: r.seo || {},
    branding: r.branding || { enabled: true, text: 'Criado com Workfy' },
    blocks: (r.blocks || []).map((block: Row) => ({
      id: block.id, biositeId: block.biosite_id, ownerId: block.owner_id, type: block.type,
      position: block.position || 0, enabled: block.enabled !== false, size: block.size || 'standard',
      content: block.content || {}, appearance: block.appearance || {},
    })),
    servicesData: (r.services_data || []).map((service: Row) => ({
      id: service.id, biositeId: service.biosite_id, name: service.name, description: service.description || '',
      price: service.price == null ? undefined : Number(service.price), promotionalPrice: service.promotional_price == null ? undefined : Number(service.promotional_price),
      durationMinutes: service.duration_minutes || undefined, mediaType: service.media_type || 'image', mediaUrl: service.media_url || undefined,
      ctaType: service.cta_type || 'booking', ctaLabel: service.cta_label || 'Agendar', featured: Boolean(service.featured),
      available: service.available !== false, position: service.position || 0,
    })),
    formsData: (r.forms_data || []).map((form: Row) => ({
      id: form.id, biositeId: form.biosite_id, title: form.title, description: form.description || '',
      submitLabel: form.submit_label || 'Enviar', fields: form.fields || [], enabled: form.enabled !== false, position: form.position || 0,
    })),
    completionProgress: r.completion_progress || 0,
    appearance: r.appearance || {},
    sections: r.sections || {},
    whatsappConfig: r.whatsapp_config || { phoneNumber: '', defaultMessage: '', buttonLabel: '' },
    actionButtonsData: r.action_buttons_data || [],
    catalogCategories: r.catalog_categories || [],
    catalogItems: r.catalog_items || [],
    socialLinksData: r.social_links_data || {},
    analytics: { ...emptyAnalytics(), views: r.views_count || 0 },
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  } as Biosite;
}

function biositeToRow(b: Partial<Biosite>): Row {
  const map: Array<[keyof Biosite, string]> = [
    ['slug', 'slug'], ['name', 'name'], ['category', 'category'],
    ['shortDescription', 'short_description'], ['logoUrl', 'logo_url'], ['coverUrl', 'cover_url'],
    ['status', 'status'],
    ['completionProgress', 'completion_progress'], ['appearance', 'appearance'], ['sections', 'sections'],
    ['whatsappConfig', 'whatsapp_config'], ['actionButtonsData', 'action_buttons_data'],
    ['catalogCategories', 'catalog_categories'], ['catalogItems', 'catalog_items'],
    ['socialLinksData', 'social_links_data'],
    ['showcaseOptIn', 'showcase_opt_in'], ['showcasedAt', 'showcased_at'], ['seo', 'seo'], ['branding', 'branding'],
  ];
  const out: Row = {};
  for (const [k, col] of map) {
    if (k in b) {
      const v = (b as any)[k];
      out[col] = v === undefined || v === '' && (col.endsWith('_date') || col.endsWith('_url')) ? null : v;
    }
  }
  return out;
}

let currentUser: User | null = null;
let biositesCache: Biosite[] = [];
const pendingSaves = new Map<string, ReturnType<typeof setTimeout>>();
const pendingPayload = new Map<string, Row>();
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((l) => l());

async function flushSave(id: string) {
  const payload = pendingPayload.get(id);
  pendingPayload.delete(id);
  pendingSaves.delete(id);
  if (!payload || Object.keys(payload).length === 0) return;
  const { error } = await supabase.from('biosites').update(payload as any).eq('id', id);
  if (error) console.error('Erro ao guardar biosite:', error.message);
}

function queueSave(id: string, row: Row) {
  pendingPayload.set(id, { ...(pendingPayload.get(id) || {}), ...row });
  const t = pendingSaves.get(id);
  if (t) clearTimeout(t);
  pendingSaves.set(id, setTimeout(() => void flushSave(id), 600));
}

function authError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já está registado. Faça login.';
  if (m.includes('email not confirmed')) return 'Confirme o seu e-mail antes de entrar (verifique a caixa de entrada).';
  if (m.includes('password')) return 'A senha não cumpre os requisitos de segurança.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde um momento e tente novamente.';
  return 'Não conseguimos processar o acesso. Tente novamente.';
}

const MEDIA_LINK_TTL = 60 * 60 * 24 * 365;

export const StorageService = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Loads session, profile and the user's biosites into memory. */
  async loadSession(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;
    if (!authUser) {
      currentUser = null;
      biositesCache = [];
      return null;
    }
    const [{ data: profile }, { data: rows }, { data: blocks }, { data: services }, { data: forms }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
      supabase.from('biosites').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
      supabase.from('biosite_blocks' as any).select('*').eq('owner_id', authUser.id).order('position'),
      supabase.from('biosite_services' as any).select('*').eq('owner_id', authUser.id).order('position'),
      supabase.from('biosite_forms' as any).select('*').eq('owner_id', authUser.id).order('position'),
    ]);
    currentUser = {
      id: authUser.id,
      name: profile?.name || (authUser.user_metadata as any)?.name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      avatarUrl: profile?.avatar_url || undefined,
      createdAt: profile?.created_at || authUser.created_at,
    };
    biositesCache = (rows || []).map((row) => rowToBiosite({
      ...row,
      blocks: (blocks || []).filter((item: Row) => item.biosite_id === row.id),
      services_data: (services || []).filter((item: Row) => item.biosite_id === row.id),
      forms_data: (forms || []).filter((item: Row) => item.biosite_id === row.id),
    }));
    return currentUser;
  },

  getCurrentUser(): User | null {
    return currentUser;
  },

  async updateProfile(name: string): Promise<User | null> {
    if (!currentUser) return null;
    const { error } = await supabase.from('profiles').update({ name }).eq('id', currentUser.id);
    if (error) throw new Error(error.message);
    currentUser = { ...currentUser, name };
    notify();
    return currentUser;
  },

  async login(email: string, password: string): Promise<User> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(authError(error.message));
    const u = await this.loadSession();
    if (!u) throw new Error('Não conseguimos iniciar a sessão.');
    return u;
  },

  async signup(name: string, email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw new Error(authError(error.message));
    if (!data.session) return null; // e-mail confirmation required
    return this.loadSession();
  },

  async logout() {
    await Promise.all([...pendingSaves.keys()].map((id) => flushSave(id)));
    await supabase.auth.signOut();
    currentUser = null;
    biositesCache = [];
  },

  getBiosites(_userId?: string): Biosite[] {
    return biositesCache;
  },

  getBiositeById(id: string): Biosite | null {
    return biositesCache.find((b) => b.id === id) || null;
  },

  async fetchPublicBiosite(slug: string): Promise<Biosite | null> {
    const clean = slug.toLowerCase().trim().replace(/\/+$/, '');
    if (!clean) return null;
    const { data, error } = await supabase.rpc('get_public_biosite', { p_slug: clean });
    if (!error && data) return rowToBiosite(data as Row);
    // Owner can preview own drafts
    return biositesCache.find((b) => b.slug.toLowerCase() === clean) || null;
  },

  isSlugAvailable(slug: string, excludeId?: string): boolean {
    const clean = slug.toLowerCase().trim();
    const found = biositesCache.find((b) => b.slug.toLowerCase() === clean);
    return !found || found.id === excludeId;
  },

  async checkSlugRemote(slug: string, excludeId?: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_slug_available', {
      p_slug: slug,
      ...(excludeId ? { p_exclude_id: excludeId } : {}),
    });
    if (error) return this.isSlugAvailable(slug, excludeId);
    return Boolean(data);
  },

  async createEmptyBiosite(
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
  ): Promise<Biosite> {
    const baseName = initial?.name?.trim() || 'meu-negocio';
    let baseSlug = baseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = 'meu-negocio';

    let finalSlug = baseSlug;
    let counter = 1;
    while (!(await this.checkSlugRemote(finalSlug))) {
      finalSlug = `${baseSlug}-${counter++}`;
      if (counter > 50) {
        finalSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
        break;
      }
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
      showcaseOptIn: false,
      seo: {},
      branding: { enabled: true, text: 'Criado com Workfy' },
      blocks: [],
      servicesData: [],
      formsData: [],
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


    const { data, error } = await supabase
      .from('biosites')
      .insert({ ...biositeToRow(newBiosite), user_id: userId } as any)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message || 'Falha ao criar biosite');
    const created = rowToBiosite(data);
    biositesCache = [created, ...biositesCache];
    notify();
    return created;
  },

  updateBiosite(id: string, updates: Partial<Biosite>): Biosite | null {
    const index = biositesCache.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const updated: Biosite = { ...biositesCache[index], ...updates, updatedAt: new Date().toISOString() };
    const next = [...biositesCache];
    next[index] = updated;
    biositesCache = next;
    queueSave(id, biositeToRow(updates));
    return updated;
  },

  async saveNow(id: string) {
    const t = pendingSaves.get(id);
    if (t) clearTimeout(t);
    await flushSave(id);
  },

  publishBiosite(id: string): Biosite | null {
    const b = this.updateBiosite(id, { status: 'published' });
    void this.saveNow(id);
    return b;
  },

  unpublishBiosite(id: string): Biosite | null {
    const b = this.updateBiosite(id, { status: 'draft' });
    void this.saveNow(id);
    return b;
  },

  async deleteBiosite(id: string): Promise<boolean> {
    const t = pendingSaves.get(id);
    if (t) clearTimeout(t);
    pendingPayload.delete(id);
    const { error } = await supabase.from('biosites').delete().eq('id', id);
    if (error) return false;
    biositesCache = biositesCache.filter((b) => b.id !== id);
    return true;
  },

  trackEvent(
    slug: string,
    type: 'view' | 'whatsapp' | 'call' | 'location' | 'appointment' | 'product' | 'form_submit' | 'booking_click' | 'service_click' | 'button_click' | 'social_click',
    label?: string
  ) {
    void supabase.rpc('track_biosite_event', { p_slug: slug, p_type: type, p_label: label || undefined });
  },

  async fetchAnalytics(id: string): Promise<Biosite['analytics']> {
    const { data, error } = await supabase.rpc('get_biosite_analytics', { p_biosite_id: id });
    if (error || !data) return emptyAnalytics();
    return { ...emptyAnalytics(), ...(data as any) };
  },

  /** Re-signs private media links of a biosite so public pages never show expired media. */
  async refreshMediaLinks(biositeId: string) {
    const site = biositesCache.find((b) => b.id === biositeId);
    if (!site) return;
    const re = /https?:\/\/[^"\s]*\/storage\/v1\/object\/sign\/biosite-images\/([^?"\s]+)\?token=[^"\s]+/g;
    const { blocks, servicesData, formsData, analytics, ...core } = site;
    const parts = { core: JSON.stringify(core), blocks: JSON.stringify(blocks || []), services: JSON.stringify(servicesData || []) };
    const paths = new Set<string>();
    Object.values(parts).forEach((t) => { for (const m of t.matchAll(re)) paths.add(decodeURIComponent(m[1])); });
    if (!paths.size) return;
    const { data, error } = await supabase.storage.from('biosite-images').createSignedUrls([...paths], MEDIA_LINK_TTL);
    if (error || !data) return;
    const fresh = new Map(data.filter((d) => d.signedUrl && d.path).map((d) => [d.path as string, d.signedUrl]));
    const swap = (t: string) => t.replace(re, (full, p1) => fresh.get(decodeURIComponent(p1)) || full);
    const nextCore = JSON.parse(swap(parts.core));
    const changed: Partial<Biosite> = {};
    (['logoUrl', 'coverUrl', 'appearance', 'catalogItems', 'catalogCategories', 'sections', 'seo'] as const).forEach((k) => {
      if (JSON.stringify((core as any)[k]) !== JSON.stringify(nextCore[k])) (changed as any)[k] = nextCore[k];
    });
    if (Object.keys(changed).length) { this.updateBiosite(biositeId, changed); await this.saveNow(biositeId); }
    const nextBlocks: BiositeBlock[] = JSON.parse(swap(parts.blocks));
    for (const b of nextBlocks) {
      const old = (blocks || []).find((o) => o.id === b.id);
      if (old && JSON.stringify(old.content) !== JSON.stringify(b.content)) {
        await supabase.from('biosite_blocks' as any).update({ content: b.content, appearance: b.appearance } as any).eq('id', b.id);
      }
    }
    const nextServices: BiositeService[] = JSON.parse(swap(parts.services));
    for (const sv of nextServices) {
      const old = (servicesData || []).find((o) => o.id === sv.id);
      if (old && old.mediaUrl !== sv.mediaUrl) await supabase.from('biosite_services' as any).update({ media_url: sv.mediaUrl } as any).eq('id', sv.id);
    }
    const idx = biositesCache.findIndex((b) => b.id === biositeId);
    if (idx !== -1) { biositesCache = biositesCache.map((b, i) => i === idx ? { ...b, blocks: nextBlocks, servicesData: nextServices } : b); notify(); }
  },

  /** Uploads an image to the user's private folder and returns a long-lived URL. */
  async uploadImage(file: Blob, ext: string): Promise<string> {
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    if (!uid) throw new Error('Sessão expirada. Entre novamente.');
    const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('biosite-images')
      .upload(path, file, { contentType: file.type, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error(error.message);
    const { data, error: e2 } = await supabase.storage
      .from('biosite-images')
      .createSignedUrl(path, MEDIA_LINK_TTL);
    if (e2 || !data) throw new Error(e2?.message || 'Falha ao gerar link da imagem');
    return data.signedUrl;
  },

  async listShowcaseBiosites(limit = 8): Promise<Biosite[]> {
    const { data, error } = await supabase.rpc('list_showcase_biosites' as any, { p_limit: limit });
    if (error || !Array.isArray(data)) return [];
    return data.map((row: Row) => rowToBiosite(row));
  },

  async setShowcaseOptIn(id: string, enabled: boolean): Promise<Biosite | null> {
    const updated = this.updateBiosite(id, { showcaseOptIn: enabled, showcasedAt: enabled ? new Date().toISOString() : undefined });
    await this.saveNow(id);
    return updated;
  },

  async saveBlock(biositeId: string, block: BiositeBlock): Promise<BiositeBlock> {
    if (!currentUser) throw new Error('Sessão expirada.');
    const payload = { id: block.id.startsWith('block-') ? undefined : block.id, biosite_id: biositeId, owner_id: currentUser.id, type: block.type, position: block.position, enabled: block.enabled, size: block.size, content: block.content, appearance: block.appearance };
    const { data, error } = await supabase.from('biosite_blocks' as any).upsert(payload as any).select('*').single();
    if (error || !data) throw new Error(error?.message || 'Não foi possível guardar o bloco.');
    const saved = rowToBiosite({ id: biositeId, slug: '', blocks: [data] }).blocks?.[0] as BiositeBlock;
    const site = this.getBiositeById(biositeId);
    if (site) this.updateBiosite(biositeId, { blocks: [...(site.blocks || []).filter((item) => item.id !== block.id), saved].sort((a,b) => a.position-b.position) });
    return saved;
  },

  async deleteBlock(biositeId: string, blockId: string) {
    const { error } = await supabase.from('biosite_blocks' as any).delete().eq('id', blockId);
    if (error) throw new Error(error.message);
    const site = this.getBiositeById(biositeId);
    if (site) this.updateBiosite(biositeId, { blocks: (site.blocks || []).filter((item) => item.id !== blockId) });
  },

  async submitForm(slug: string, formId: string, payload: Record<string, string>) {
    const normalized = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value || '').slice(0, 2000)]));
    const { error } = await supabase.rpc('submit_biosite_form' as any, { p_slug: slug, p_form_id: formId, p_payload: normalized });
    if (error) throw new Error('Não foi possível enviar. Tente novamente.');
  },

  async submitBooking(slug: string, serviceId: string, values: { name: string; phone: string; email?: string; date: string; time: string; notes?: string }) {
    const { error } = await supabase.rpc('submit_biosite_booking' as any, { p_slug: slug, p_service_id: serviceId, p_name: values.name.slice(0, 120), p_phone: values.phone.slice(0, 40), p_email: (values.email || '').slice(0, 160), p_date: values.date, p_time: values.time, p_notes: (values.notes || '').slice(0, 1000) });
    if (error) throw new Error('Não foi possível solicitar o agendamento.');
  },

  async fetchInbox() {
    if (!currentUser) return { leads: [], bookings: [] };
    const [{ data: leads }, { data: bookings }] = await Promise.all([
      supabase.from('biosite_leads' as any).select('*').eq('owner_id', currentUser.id).order('created_at', { ascending: false }),
      supabase.from('biosite_bookings' as any).select('*, biosite_services(name)').eq('owner_id', currentUser.id).order('scheduled_date'),
    ]);
    return { leads: leads || [], bookings: bookings || [] };
  },

  async setLeadStatus(id: string, status: 'new' | 'contacted' | 'closed') {
    const { error } = await supabase.from('biosite_leads' as any).update({ status } as any).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async setBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    const { error } = await supabase.from('biosite_bookings' as any).update({ status } as any).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async createService(biositeId: string, service: Omit<BiositeService, 'id' | 'biositeId'>) {
    if (!currentUser) throw new Error('Sessão expirada.');
    const { data, error } = await supabase.from('biosite_services' as any).insert({ biosite_id: biositeId, owner_id: currentUser.id, name: service.name, description: service.description, price: service.price, promotional_price: service.promotionalPrice, duration_minutes: service.durationMinutes, media_type: service.mediaType, media_url: service.mediaUrl, cta_type: service.ctaType, cta_label: service.ctaLabel, featured: service.featured, available: service.available, position: service.position } as any).select('*').single();
    if (error || !data) throw new Error(error?.message || 'Não foi possível criar o serviço.');
    await this.loadSession();
    notify();
    return data;
  },

  async createForm(biositeId: string, form: Omit<BiositeForm, 'id' | 'biositeId'>) {
    if (!currentUser) throw new Error('Sessão expirada.');
    const { data, error } = await supabase.from('biosite_forms' as any).insert({ biosite_id: biositeId, owner_id: currentUser.id, title: form.title, description: form.description, submit_label: form.submitLabel, fields: form.fields, enabled: form.enabled, position: form.position } as any).select('*').single();
    if (error || !data) throw new Error(error?.message || 'Não foi possível criar o formulário.');
    await this.loadSession();
    notify();
    return data;
  },

  async updateService(serviceId: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from('biosite_services' as any).update(patch as any).eq('id', serviceId);
    if (error) throw new Error(error.message);
    await this.loadSession();
    notify();
  },

  async deleteService(serviceId: string) {
    const { error } = await supabase.from('biosite_services' as any).delete().eq('id', serviceId);
    if (error) throw new Error(error.message);
    await this.loadSession();
    notify();
  },

  async updateForm(formId: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from('biosite_forms' as any).update(patch as any).eq('id', formId);
    if (error) throw new Error(error.message);
    await this.loadSession();
    notify();
  },

  async deleteForm(formId: string) {
    const { error } = await supabase.from('biosite_forms' as any).delete().eq('id', formId);
    if (error) throw new Error(error.message);
    await this.loadSession();
    notify();
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

};
