import React, { useState, useEffect, useRef } from 'react';
import {
  Biosite,
  BusinessCategory,
  CatalogCategory,
  CatalogItem,
  BiositeBlock,
  BiositeService,
  BiositeForm,
  DaySchedule,
  ThemePreset,
  ButtonStyle,
  CatalogLayout,
  BackgroundType,
  ButtonEffect,
  CardBorderStyle,
} from '../types';
import { StorageService } from '../services/storage';
import { formatPrice, CURRENCIES } from '../utils/currency';
import { PhoneInput } from './PhoneInput';
import { copyToClipboard, openExternalUrl } from '../utils/browser';
import { BiositeViewer } from './BiositeViewer';
import { QrCodeModal } from './QrCodeModal';
import { ImageUploader } from './ImageUploader';
import { EditorContentPanels } from './EditorContentPanels';
import {
  THEME_PRESETS,
  GRADIENT_PALETTES,
  SOLID_PALETTES,
  CARD_BG_PALETTES,
  BORDER_COLOR_PALETTES,
  BUTTON_BG_PALETTES,
} from '../constants/themes';
import {
  ArrowLeft,
  Eye,
  Check,
  Smartphone,
  Save,
  Share2,
  QrCode as QrIcon,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  MessageCircle,
  MapPin,
  Clock,
  Calendar,
  Layers,
  Palette,
  Globe,
  CheckCircle2,
  X,
  AlertCircle,
  Info,
  LayoutList,
  LayoutGrid,
  Columns,
  Maximize2,
  Paintbrush,
  Sliders,
  Rocket,
  AlertTriangle,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  Music2,
} from 'lucide-react';

interface BiositeEditorProps {
  biositeId: string;
  onNavigate: (route: string) => void;
}

type EditorTab = 'identity' | 'blocks' | 'catalog' | 'services' | 'forms' | 'whatsapp' | 'location' | 'schedule' | 'appointment' | 'social' | 'appearance';

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

const PRESETS: Array<{ id: ThemePreset; name: string; color: string; btn: ButtonStyle }> = [
  { id: 'modern', name: 'Modern', color: '#155EEF', btn: 'rounded' },
  { id: 'minimal', name: 'Minimal', color: '#0B1F3A', btn: 'rounded' },
  { id: 'classic', name: 'Classic', color: '#1F2937', btn: 'square' },
  { id: 'elegant', name: 'Elegant', color: '#1E40AF', btn: 'pill' },
];

const FONT_OPTIONS = [
  { name: 'Modern', value: "'Plus Jakarta Sans', sans-serif" },
  { name: 'Clean', value: "Arial, Helvetica, sans-serif" },
  { name: 'Elegant', value: "Avenir, 'Avenir Next', sans-serif" },
  { name: 'Classic', value: "'Trebuchet MS', Arial, sans-serif" },
  { name: 'Bold', value: "Impact, 'Arial Narrow', sans-serif" },
];

export const BiositeEditor: React.FC<BiositeEditorProps> = ({ biositeId, onNavigate }) => {
  const [biosite, setBiosite] = useState<Biosite | null>(() =>
    StorageService.getBiositeById(biositeId)
  );

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving'>('saved');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [popupBlockedNotice, setPopupBlockedNotice] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Modals for adding/editing items
  const [editingCategory, setEditingCategory] = useState<CatalogCategory | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<CatalogItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isFeatured: false,
    ctaType: 'whatsapp' as 'whatsapp' | 'appointment' | 'info',
  });
  const [blockForm, setBlockForm] = useState({ type: 'text' as BiositeBlock['type'], text: '', url: '' });
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', durationMinutes: '', mediaUrl: '', mediaType: 'image' as 'image' | 'video', ctaType: 'booking' as BiositeService['ctaType'] });
  const [leadFormTitle, setLeadFormTitle] = useState('Pedir contacto');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loaded = StorageService.getBiositeById(biositeId);
    if (!loaded) {
      onNavigate('/dashboard');
    } else {
      setBiosite(loaded);
      void StorageService.refreshMediaLinks(biositeId).then(() => {
        const fresh = StorageService.getBiositeById(biositeId);
        if (fresh) setBiosite(fresh);
      });
    }
  }, [biositeId, onNavigate]);

  // Safe Autosave on every state modification
  const triggerAutoSave = (updated: Biosite) => {
    setBiosite(updated);
    setAutosaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      StorageService.updateBiosite(updated.id, updated);
      setAutosaveStatus('saved');
    }, 450);
  };

  if (!biosite) return null;

  const publicUrl = `${window.location.origin}/b/${biosite.slug}`;

  const syncCurrentBiosite = () => {
    const latest = StorageService.getBiositeById(biosite.id);
    if (latest) setBiosite(latest);
  };

  const handleAddBlock = async () => {
    const type = blockForm.type;
    const content = type === 'text' ? { text: blockForm.text.trim() } : { url: blockForm.url.trim() };
    if ((type === 'text' && !blockForm.text.trim()) || (type !== 'spacer' && type !== 'text' && !blockForm.url.trim())) return;
    const block: BiositeBlock = {
      id: `block-${Date.now()}`, biositeId: biosite.id, ownerId: biosite.userId, type, enabled: true, size: 'standard',
      position: (biosite.blocks || []).length + 1, content, appearance: {},
    };
    const saved = await StorageService.saveBlock(biosite.id, block);
    triggerAutoSave({ ...biosite, blocks: [...(biosite.blocks || []), saved] });
    setBlockForm({ type: 'text', text: '', url: '' });
  };

  const handleAddService = async () => {
    if (!serviceForm.name.trim()) return;
    await StorageService.createService(biosite.id, {
      name: serviceForm.name.trim(), description: serviceForm.description.trim(), price: serviceForm.price ? Number(serviceForm.price) : undefined,
      durationMinutes: serviceForm.durationMinutes ? Number(serviceForm.durationMinutes) : undefined, mediaType: serviceForm.mediaType, mediaUrl: serviceForm.mediaUrl.trim() || undefined,
      ctaType: serviceForm.ctaType, ctaLabel: serviceForm.ctaType === 'booking' ? 'Agendar' : serviceForm.ctaType === 'whatsapp' ? 'Pedir no WhatsApp' : 'Saber mais',
      featured: false, available: true, position: (biosite.servicesData || []).length + 1,
    });
    syncCurrentBiosite();
    setServiceForm({ name: '', description: '', price: '', durationMinutes: '', mediaUrl: '', mediaType: 'image', ctaType: 'booking' });
  };

  const handleAddLeadForm = async () => {
    const form: Omit<BiositeForm, 'id' | 'biositeId'> = {
      title: leadFormTitle.trim() || 'Pedir contacto', description: 'Preencha os dados para o negócio responder.', submitLabel: 'Enviar', enabled: true, position: (biosite.formsData || []).length + 1,
      fields: [
        { id: 'name', type: 'text', label: 'Nome', required: true },
        { id: 'phone', type: 'tel', label: 'Telefone / WhatsApp', required: true },
        { id: 'message', type: 'textarea', label: 'Mensagem', required: false },
      ],
    };
    await StorageService.createForm(biosite.id, form);
    syncCurrentBiosite();
    setLeadFormTitle('Pedir contacto');
  };

  const toggleBlock = async (block: BiositeBlock) => { await StorageService.saveBlock(biosite.id, { ...block, enabled: !block.enabled }); syncCurrentBiosite(); };
  const deleteBlock = async (blockId: string) => { await StorageService.deleteBlock(biosite.id, blockId); syncCurrentBiosite(); };

  // Handle Slug Update
  const handleSlugChange = (newSlugRaw: string) => {
    const clean = newSlugRaw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!clean) return;
    setSlugError(null);
    StorageService.checkSlugRemote(clean, biosite.id).then((ok) => {
      if (!ok) {
        setSlugError('Este link já está em uso por outro biosite.');
      } else {
        const current = StorageService.getBiositeById(biosite.id);
        if (current) triggerAutoSave({ ...current, slug: clean });
      }
    });
  };

  // Publish Biosite
  const handlePublish = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const updated = StorageService.updateBiosite(biosite.id, {
      ...biosite,
      status: 'published',
    });
    void StorageService.saveNow(biosite.id);
    if (updated) {
      setBiosite(updated);
      setAutosaveStatus('saved');
      setPopupBlockedNotice(false);
      setShowPublishModal(true);
    }
  };

  // Unpublish (Revert to Draft)
  const handleUnpublish = () => {
    if (window.confirm('Deseja realmente voltar este biosite para a fase de Rascunho? A página pública ficará marcada como prévia de rascunho.')) {
      const updated = StorageService.unpublishBiosite(biosite.id);
      if (updated) {
        setBiosite(updated);
      }
    }
  };

  // Category Actions
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryNameInput('');
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CatalogCategory) => {
    setEditingCategory(cat);
    setCategoryNameInput(cat.name);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;

    let updatedCategories = [...biosite.catalogCategories];
    if (editingCategory) {
      updatedCategories = updatedCategories.map((c) =>
        c.id === editingCategory.id ? { ...c, name: categoryNameInput.trim() } : c
      );
    } else {
      const newCat: CatalogCategory = {
        id: `cat-${Date.now()}`,
        name: categoryNameInput.trim(),
        order: updatedCategories.length + 1,
      };
      updatedCategories.push(newCat);
    }

    triggerAutoSave({
      ...biosite,
      catalogCategories: updatedCategories,
    });
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm('Excluir esta categoria? Os produtos vinculados perderão a categoria.')) {
      const updatedCategories = biosite.catalogCategories.filter((c) => c.id !== catId);
      const updatedItems = biosite.catalogItems.map((i) =>
        i.categoryId === catId ? { ...i, categoryId: '' } : i
      );
      triggerAutoSave({
        ...biosite,
        catalogCategories: updatedCategories,
        catalogItems: updatedItems,
      });
    }
  };

  // Product Actions
  const handleOpenAddProduct = (defaultCatId?: string) => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      categoryId: defaultCatId || biosite.catalogCategories[0]?.id || '',
      imageUrl: '',
      isFeatured: false,
      ctaType: 'whatsapp',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (item: CatalogItem) => {
    setEditingProduct(item);
    setProductForm({
      name: item.name,
      description: item.description,
      price: item.price ? item.price.toString() : '',
      categoryId: item.categoryId || '',
      imageUrl: item.imageUrl || '',
      isFeatured: !!item.isFeatured,
      ctaType: item.ctaType || 'whatsapp',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    const numPrice = parseFloat(productForm.price.replace(/[^\d.]/g, '')) || 0;
    let updatedItems = [...biosite.catalogItems];

    if (editingProduct) {
      updatedItems = updatedItems.map((i) =>
        i.id === editingProduct.id
          ? {
              ...i,
              name: productForm.name.trim(),
              description: productForm.description.trim(),
              price: numPrice,
              categoryId: productForm.categoryId,
              imageUrl: productForm.imageUrl.trim() || undefined,
              isFeatured: productForm.isFeatured,
              ctaType: productForm.ctaType,
            }
          : i
      );
    } else {
      const newItem: CatalogItem = {
        id: `item-${Date.now()}`,
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: numPrice,
        categoryId: productForm.categoryId,
        imageUrl: productForm.imageUrl.trim() || undefined,
        isFeatured: productForm.isFeatured,
        ctaType: productForm.ctaType,
        order: updatedItems.length + 1,
      };
      updatedItems.push(newItem);
    }

    triggerAutoSave({
      ...biosite,
      catalogItems: updatedItems,
    });
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (itemId: string) => {
    if (window.confirm('Excluir este item do catálogo?')) {
      const updated = biosite.catalogItems.filter((i) => i.id !== itemId);
      triggerAutoSave({
        ...biosite,
        catalogItems: updated,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F9FC] text-[#101828] overflow-hidden">
      {/* TOP HEADER */}
      <header className="h-14 shrink-0 border-b border-[#EEF3F8] bg-white px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center gap-1 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Painel</span>
          </button>
          <div className="h-4 w-[1px] bg-[#EEF3F8]" />
          <div>
            <h2 className="text-xs font-bold text-[#0B1F3A] truncate max-w-[160px] sm:max-w-[240px]">
              {biosite.name || 'Biosite sem título'}
            </h2>
            <span className="text-[10px] text-[#667085] block truncate">
              workfy.app/b/{biosite.slug}
            </span>
          </div>
        </div>

        {/* CENTER MOBILE TOGGLE */}
        <div className="md:hidden flex items-center bg-[#F7F9FC] p-1 rounded-xl border border-[#EEF3F8]">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileView === 'editor' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#667085]'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              mobileView === 'preview' ? 'bg-white text-[#155EEF] shadow-2xs' : 'text-[#667085]'
            }`}
          >
            Preview
          </button>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {/* Status Indicator Badge */}
          {biosite.status === 'published' ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span>Produção (Público)</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Rascunho</span>
            </span>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-[#667085] px-2">
            <span
              className={`h-2 w-2 rounded-full ${
                autosaveStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
            <span>{autosaveStatus === 'saving' ? 'Salvando...' : 'Salvo'}</span>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            title="Ver QR Code"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#0B1F3A] transition-colors"
          >
            <QrIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              const opened = openExternalUrl(publicUrl);
              if (!opened) {
                onNavigate(`/b/${biosite.slug}`);
              }
            }}
            title="Abrir página pública"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-[#EEF3F8] bg-white text-[#667085] hover:text-[#155EEF] hover:border-blue-200 transition-colors cursor-pointer text-xs font-semibold"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ver no Ar</span>
          </button>

          {/* Explicit Publicar Biosite button */}
          <button
            onClick={handlePublish}
            id="btn-publicar-biosite-topo"
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer ${
              biosite.status === 'published'
                ? 'bg-[#155EEF] hover:bg-[#124bbf]'
                : 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400/30'
            }`}
          >
            {biosite.status === 'published' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Publicar Biosite</span>
              </>
            ) : (
              <>
                <Rocket className="h-3.5 w-3.5" />
                <span>Publicar Biosite</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* EDITOR WORKSPACE (SPLIT LAYOUT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CONTROLS PANEL */}
        <div
          className={`w-full md:w-[460px] lg:w-[480px] bg-white border-r border-[#EEF3F8] flex flex-col shrink-0 ${
            mobileView === 'preview' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* PUBLICATION STATUS CALLOUT BANNER */}
          {biosite.status === 'draft' ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 p-3 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-950">Fase de Rascunho</span>
                    <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-1.5 rounded">
                      Privado
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 truncate">
                    Publique para colocar em produção pública
                  </p>
                </div>
              </div>
              <button
                onClick={handlePublish}
                id="btn-publicar-biosite-painel"
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>Publicar Biosite</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/70 border-b border-emerald-200 px-3.5 py-2 flex items-center justify-between gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-emerald-900 truncate">
                  Biosite em Produção (Público)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const opened = openExternalUrl(publicUrl);
                    if (!opened) {
                      onNavigate(`/b/${biosite.slug}`);
                    }
                  }}
                  className="text-[11px] text-emerald-800 font-bold hover:underline bg-emerald-100/70 px-2.5 py-1 rounded cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ver no Ar</span>
                </button>
                <button
                  onClick={async () => {
                    await copyToClipboard(publicUrl);
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 2500);
                  }}
                  className="text-[11px] text-emerald-800 font-bold hover:underline bg-emerald-100/60 px-2 py-1 rounded cursor-pointer"
                >
                  {copiedNotice ? '✓ Copiado!' : 'Copiar Link'}
                </button>
                <button
                  onClick={handleUnpublish}
                  title="Voltar para rascunho"
                  className="text-[11px] text-[#667085] hover:text-amber-800 cursor-pointer ml-1"
                >
                  Despublicar
                </button>
              </div>
            </div>
          )}

          <div className="border-b border-[#EEF3F8] bg-white px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0B1F3A]">Mostrar na página inicial</p>
              <p className="text-[11px] text-[#667085]">O seu biosite pode aparecer no celular da vitrine quando estiver publicado.</p>
            </div>
            <input type="checkbox" className="h-5 w-5 shrink-0 accent-[#155EEF]" aria-label="Mostrar meu biosite na página inicial" checked={!!biosite.showcaseOptIn} onChange={(event) => triggerAutoSave({...biosite, showcaseOptIn: event.target.checked, showcasedAt: event.target.checked ? new Date().toISOString() : undefined})} />
          </div>

          {/* HORIZONTAL SECTION TABS */}
          <div className="flex border-b border-[#EEF3F8] overflow-x-auto scrollbar-none bg-[#F7F9FC]">
            {[
              { id: 'identity', label: 'Negócio', icon: Layers },
              { id: 'blocks', label: 'Blocos', icon: LayoutList },
              { id: 'catalog', label: 'Catálogo', icon: Plus },
              { id: 'services', label: 'Serviços', icon: Calendar },
              { id: 'forms', label: 'Leads', icon: Edit2 },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
              { id: 'location', label: 'Localização', icon: MapPin },
              { id: 'schedule', label: 'Horário', icon: Clock },
              { id: 'appointment', label: 'Agendar', icon: Calendar },
              { id: 'social', label: 'Redes', icon: Globe },
              { id: 'appearance', label: 'Aparência', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as EditorTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                    isActive
                      ? 'border-[#155EEF] bg-white text-[#155EEF]'
                      : 'border-transparent text-[#667085] hover:text-[#0B1F3A]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(activeTab === 'blocks' || activeTab === 'services' || activeTab === 'forms') && (
              <EditorContentPanels tab={activeTab} biosite={biosite} onChanged={syncCurrentBiosite} />
            )}
            {/* 1. NEGÓCIO / IDENTIDADE */}
            {activeTab === 'identity' && (
              <div className="space-y-4">
                {/* STATUS & PUBLISH CARD */}
                <div className={`rounded-2xl border p-4 space-y-3 ${
                  biosite.status === 'published'
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-amber-200 bg-amber-50/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B1F3A]">Status do Biosite</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      biosite.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        biosite.status === 'published' ? 'bg-emerald-600' : 'bg-amber-600'
                      }`} />
                      {biosite.status === 'published' ? 'Produção (Público)' : 'Fase de Rascunho'}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed">
                    {biosite.status === 'published'
                      ? 'Seu biosite está publicado e acessível publicamente para seus clientes.'
                      : 'Este biosite está em modo rascunho. Clique no botão abaixo para publicá-lo na produção.'}
                  </p>

                  <div className="pt-1">
                    {biosite.status === 'draft' ? (
                      <button
                        onClick={handlePublish}
                        id="btn-publicar-biosite-identidade"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <Rocket className="h-4 w-4" />
                        <span>Publicar Biosite</span>
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handlePublish}
                          id="btn-republicar-biosite-identidade"
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#155EEF] hover:bg-[#124bbf] text-white py-2 px-3 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Publicar Biosite</span>
                        </button>
                        <button
                          onClick={handleUnpublish}
                          className="rounded-xl border border-[#EEF3F8] bg-white hover:bg-amber-50 hover:text-amber-900 text-[#667085] py-2 px-3 text-xs font-semibold transition-all cursor-pointer"
                        >
                          Tornar Rascunho
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0B1F3A]">Identidade do Negócio</h3>
                  <p className="text-xs text-[#667085]">
                    Informações principais visíveis no topo da sua página.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Nome do negócio
                  </label>
                  <input
                    type="text"
                    value={biosite.name}
                    onChange={(e) => triggerAutoSave({ ...biosite, name: e.target.value })}
                    placeholder="Ex: Barbearia Andrian"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Categoria</label>
                  <select
                    value={biosite.category}
                    onChange={(e) =>
                      triggerAutoSave({ ...biosite, category: e.target.value as BusinessCategory })
                    }
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Descrição curta
                  </label>
                  <textarea
                    rows={2}
                    value={biosite.shortDescription}
                    onChange={(e) =>
                      triggerAutoSave({ ...biosite, shortDescription: e.target.value })
                    }
                    placeholder="Ex: Cortes clássicos, barba e atendimento exclusivo em Luanda."
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Link público (slug)
                  </label>
                  <div className="flex rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] overflow-hidden">
                    <span className="bg-[#EEF3F8] px-3 py-2 text-xs text-[#667085] font-medium select-none">
                      /b/
                    </span>
                    <input
                      type="text"
                      value={biosite.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="nome-do-negocio"
                      className="w-full bg-transparent px-3 py-2 text-xs text-[#0B1F3A] focus:outline-hidden"
                    />
                  </div>
                  {slugError && (
                    <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {slugError}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EEF3F8] space-y-4">
                  <ImageUploader
                    label="Logo ou Foto de Perfil"
                    value={biosite.logoUrl || ''}
                    onChange={(newUrl) => triggerAutoSave({ ...biosite, logoUrl: newUrl })}
                    description="Carregue diretamente da sua galeria (PNG, JPG, etc.) ou informe uma URL."
                    aspectRatio="square"
                    maxDimension={800}
                    placeholderUrl="https://..."
                  />

                  <ImageUploader
                    label="Foto de Capa (opcional)"
                    value={biosite.coverUrl || ''}
                    onChange={(newUrl) =>
                      triggerAutoSave({
                        ...biosite,
                        coverUrl: newUrl,
                        sections: {
                          ...biosite.sections,
                          profile: {
                            ...biosite.sections.profile,
                            showCover: !!newUrl,
                          },
                        },
                      })
                    }
                    description="Banner superior exibido no topo da página pública."
                    aspectRatio="wide"
                    maxDimension={1200}
                    placeholderUrl="https://..."
                  />
                </div>
              </div>
            )}

            {/* 2. CATÁLOGO & CATEGORIAS */}
            {activeTab === 'catalog' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Catálogo & Categorias</h3>
                    <label className="mt-1 flex items-center gap-2 text-xs text-[#667085]">
                      Moeda
                      <select value={biosite.appearance.currency || 'AOA'} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, currency: e.target.value } })} className="rounded-lg border border-[#EEF3F8] bg-[#F7F9FC] px-2 py-1 text-xs text-[#0B1F3A]">
                        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleOpenAddCategory}
                      className="flex items-center gap-1 rounded-lg border border-[#EEF3F8] bg-[#F7F9FC] px-2.5 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:bg-slate-100"
                    >
                      <Plus className="h-3 w-3" />
                      Categoria
                    </button>
                    <button
                      onClick={() => handleOpenAddProduct()}
                      className="flex items-center gap-1 rounded-lg bg-[#155EEF] px-2.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
                    >
                      <Plus className="h-3 w-3" />
                      Item
                    </button>
                  </div>
                </div>

                {/* Categories list */}
                <div>
                  <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-2">
                    Categorias ({biosite.catalogCategories.length})
                  </h4>
                  {biosite.catalogCategories.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#EEF3F8] p-3 text-center bg-[#F7F9FC]">
                      <p className="text-xs text-[#667085]">Nenhuma categoria criada.</p>
                      <button
                        onClick={handleOpenAddCategory}
                        className="mt-1.5 text-xs font-bold text-[#155EEF] hover:underline"
                      >
                        + Criar primeira categoria
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {biosite.catalogCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-1.5 rounded-lg border border-[#EEF3F8] bg-[#F7F9FC] px-2.5 py-1 text-xs font-semibold text-[#0B1F3A]"
                        >
                          <span>{cat.name}</span>
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="text-[#667085] hover:text-[#155EEF]"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-[#667085] hover:text-rose-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div>
                  <h4 className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-2">
                    Itens do Catálogo ({biosite.catalogItems.length})
                  </h4>
                  {biosite.catalogItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#EEF3F8] p-8 text-center bg-[#F7F9FC]">
                      <p className="text-xs font-medium text-[#667085]">
                        Seu catálogo está vazio.
                        <br />
                        Adicione seus primeiros produtos ou serviços.
                      </p>
                      <button
                        onClick={() => handleOpenAddProduct()}
                        className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#155EEF] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar produto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {biosite.catalogItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-[#EEF3F8] bg-white p-3 hover:border-slate-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-10 w-10 rounded-lg object-cover bg-slate-50 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold text-[#0B1F3A] truncate">
                                {item.name}
                              </h5>
                              <p className="text-[11px] font-semibold text-[#155EEF]">
                                {formatPrice(item.price, biosite.appearance.currency)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditProduct(item)}
                              className="p-1.5 text-[#667085] hover:text-[#155EEF] rounded-lg hover:bg-[#F7F9FC]"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(item.id)}
                              className="p-1.5 text-[#667085] hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. WHATSAPP & CONTATOS */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F3A]">WhatsApp & Contatos</h3>
                  <p className="text-xs text-[#667085]">
                    O canal central de conversão e atendimento do seu biosite.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Número de WhatsApp
                  </label>
                  <PhoneInput
                    value={biosite.whatsappConfig.phoneNumber}
                    onChange={(v) => triggerAutoSave({ ...biosite, whatsappConfig: { ...biosite.whatsappConfig, phoneNumber: v } })}
                  />
                  <p className="text-[10px] text-[#667085] mt-1">
                    Escolha o país e escreva o número.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Texto do botão principal
                  </label>
                  <input
                    type="text"
                    value={biosite.whatsappConfig.buttonLabel}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        whatsappConfig: {
                          ...biosite.whatsappConfig,
                          buttonLabel: e.target.value,
                        },
                      })
                    }
                    placeholder="Falar no WhatsApp"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Mensagem padrão pré-formatada
                  </label>
                  <textarea
                    rows={2}
                    value={biosite.whatsappConfig.defaultMessage}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        whatsappConfig: {
                          ...biosite.whatsappConfig,
                          defaultMessage: e.target.value,
                        },
                      })
                    }
                    placeholder="Ex: Olá! Vi seu perfil na Workfy e gostaria de mais informações."
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            )}

            {/* 4. LOCALIZAÇÃO */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Localização do Negócio</h3>
                    <p className="text-xs text-[#667085]">
                      Endereço e rota com botão "Como chegar".
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biosite.sections.location.enabled}
                      onChange={(e) =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            location: {
                              ...biosite.sections.location,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#155EEF]"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Endereço / Rua
                  </label>
                  <input
                    type="text"
                    value={biosite.sections.location.address}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        sections: {
                          ...biosite.sections,
                          location: {
                            ...biosite.sections.location,
                            address: e.target.value,
                            enabled: true,
                          },
                        },
                      })
                    }
                    placeholder="Ex: Rua do Comércio, nº 42, Talatona"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Cidade / Província
                  </label>
                  <input
                    type="text"
                    value={biosite.sections.location.city}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        sections: {
                          ...biosite.sections,
                          location: {
                            ...biosite.sections.location,
                            city: e.target.value,
                            enabled: true,
                          },
                        },
                      })
                    }
                    placeholder="Ex: Luanda, Angola"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Ponto de referência (opcional)
                  </label>
                  <input
                    type="text"
                    value={biosite.sections.location.reference || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        sections: {
                          ...biosite.sections,
                          location: {
                            ...biosite.sections.location,
                            reference: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Ex: Próximo ao Belas Shopping"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Link do Google Maps (opcional)
                  </label>
                  <input
                    type="url"
                    value={biosite.sections.location.googleMapsUrl || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        sections: {
                          ...biosite.sections,
                          location: {
                            ...biosite.sections.location,
                            googleMapsUrl: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 5. HORÁRIO */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Horário de Funcionamento</h3>
                    <p className="text-xs text-[#667085]">
                      Informe seus clientes quando o estabelecimento está aberto.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biosite.sections.scheduleHours.enabled}
                      onChange={(e) =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            scheduleHours: {
                              ...biosite.sections.scheduleHours,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#155EEF]"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  {biosite.sections.scheduleHours.days.map((sched, idx) => (
                    <div
                      key={sched.day}
                      className="flex items-center gap-2 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] p-2"
                    >
                      <span className="w-28 text-xs font-semibold text-[#0B1F3A] truncate">
                        {sched.day}
                      </span>
                      <input
                        type="text"
                        value={sched.hours}
                        onChange={(e) => {
                          const updatedDays = [...biosite.sections.scheduleHours.days];
                          updatedDays[idx] = { ...updatedDays[idx], hours: e.target.value };
                          triggerAutoSave({
                            ...biosite,
                            sections: {
                              ...biosite.sections,
                              scheduleHours: {
                                ...biosite.sections.scheduleHours,
                                days: updatedDays,
                                enabled: true,
                              },
                            },
                          });
                        }}
                        className="flex-1 rounded-lg border border-[#EEF3F8] bg-white px-2 py-1 text-xs text-[#0B1F3A]"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-[#667085] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sched.isOpen}
                          onChange={(e) => {
                            const updatedDays = [...biosite.sections.scheduleHours.days];
                            updatedDays[idx] = { ...updatedDays[idx], isOpen: e.target.checked };
                            triggerAutoSave({
                              ...biosite,
                              sections: {
                                ...biosite.sections,
                                scheduleHours: {
                                  ...biosite.sections.scheduleHours,
                                  days: updatedDays,
                                  enabled: true,
                                },
                              },
                            });
                          }}
                          className="rounded text-[#155EEF]"
                        />
                        <span>Aberto</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. AGENDAMENTO */}
            {activeTab === 'appointment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Agendamento</h3>
                    <p className="text-xs text-[#667085]">
                      Direcione clientes para agendar no WhatsApp ou link externo.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={biosite.sections.appointment.enabled}
                      onChange={(e) =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            appointment: {
                              ...biosite.sections.appointment,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#155EEF]"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Tipo de Agendamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            appointment: {
                              ...biosite.sections.appointment,
                              type: 'whatsapp',
                              enabled: true,
                            },
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        biosite.sections.appointment.type === 'whatsapp'
                          ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                      }`}
                    >
                      Via WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            appointment: {
                              ...biosite.sections.appointment,
                              type: 'external',
                              enabled: true,
                            },
                          },
                        })
                      }
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        biosite.sections.appointment.type === 'external'
                          ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                          : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                      }`}
                    >
                      Link Externo (Cal, etc.)
                    </button>
                  </div>
                </div>

                {biosite.sections.appointment.type === 'external' && (
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                      Link do sistema de agendamento
                    </label>
                    <input
                      type="url"
                      value={biosite.sections.appointment.externalUrl || ''}
                      onChange={(e) =>
                        triggerAutoSave({
                          ...biosite,
                          sections: {
                            ...biosite.sections,
                            appointment: {
                              ...biosite.sections.appointment,
                              externalUrl: e.target.value,
                              enabled: true,
                            },
                          },
                        })
                      }
                      placeholder="https://calendly.com/..."
                      className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 7. REDES SOCIAIS */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F3A]">Redes Sociais</h3>
                  <p className="text-xs text-[#667085]">
                    Todos os links preenchidos aparecem como ícones clicáveis no topo do seu biosite.
                  </p>
                </div>

                {/* ACTIVE ICONS SUMMARY */}
                <div className="rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] p-3">
                  <span className="text-[11px] font-bold text-[#0B1F3A] block mb-1.5">
                    Ícones Visíveis na Sua Página:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {biosite.socialLinksData.instagram?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-xs font-semibold border border-pink-200">
                        <Instagram className="h-3 w-3" /> Instagram
                      </span>
                    )}
                    {biosite.socialLinksData.tiktok?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold border border-slate-700">
                        <Music2 className="h-3 w-3 text-cyan-400" /> TikTok
                      </span>
                    )}
                    {biosite.socialLinksData.facebook?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                        <Facebook className="h-3 w-3" /> Facebook
                      </span>
                    )}
                    {biosite.socialLinksData.youtube?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                        <Youtube className="h-3 w-3" /> YouTube
                      </span>
                    )}
                    {biosite.socialLinksData.linkedin?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200">
                        <Linkedin className="h-3 w-3" /> LinkedIn
                      </span>
                    )}
                    {biosite.socialLinksData.twitter?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300">
                        <Twitter className="h-3 w-3" /> Twitter / X
                      </span>
                    )}
                    {biosite.socialLinksData.website?.trim() && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <Globe className="h-3 w-3" /> Website
                      </span>
                    )}
                    {!Object.values(biosite.socialLinksData || {}).some((v) => Boolean(v?.trim())) && (
                      <span className="text-xs text-[#667085] italic">
                        Nenhuma rede social configurada ainda. Preencha os campos abaixo.
                      </span>
                    )}
                  </div>
                </div>

                {/* INSTAGRAM */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Instagram className="h-3.5 w-3.5 text-pink-600" />
                    <span>Instagram</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.instagram || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, instagram: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://instagram.com/seunegocio ou @seunegocio"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                {/* TIKTOK */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Music2 className="h-3.5 w-3.5 text-slate-900" />
                    <span>TikTok</span>
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Ícone clicável ativo
                    </span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.tiktok || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, tiktok: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://tiktok.com/@seunegocio ou @seunegocio"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                  <p className="text-[11px] text-[#667085] mt-1">
                    Cole o link do seu perfil do TikTok ou seu @ de usuário.
                  </p>
                </div>

                {/* FACEBOOK */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Facebook className="h-3.5 w-3.5 text-blue-600" />
                    <span>Facebook</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.facebook || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, facebook: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://facebook.com/seunegocio"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                {/* YOUTUBE */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Youtube className="h-3.5 w-3.5 text-red-600" />
                    <span>YouTube</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.youtube || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, youtube: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://youtube.com/@seucanal"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                {/* LINKEDIN */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Linkedin className="h-3.5 w-3.5 text-sky-600" />
                    <span>LinkedIn</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.linkedin || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, linkedin: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://linkedin.com/in/seunegocio"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                {/* TWITTER / X */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Twitter className="h-3.5 w-3.5 text-slate-800" />
                    <span>Twitter / X</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.twitter || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, twitter: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://x.com/seunegocio ou @seunegocio"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                {/* WEBSITE OFICIAL */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-[#0B1F3A] mb-1">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Website Oficial</span>
                  </label>
                  <input
                    type="text"
                    value={biosite.socialLinksData.website || ''}
                    onChange={(e) =>
                      triggerAutoSave({
                        ...biosite,
                        socialLinksData: { ...biosite.socialLinksData, website: e.target.value },
                        sections: { ...biosite.sections, socialLinks: { enabled: true } },
                      })
                    }
                    placeholder="https://seunegocio.com"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* 8. APARÊNCIA & ESTILIZAÇÃO PROFUNDA */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F3A]">Aparência & Personalização Profunda</h3>
                  <p className="text-xs text-[#667085]">
                    Personalize fundos com degradês suaves, formatos do catálogo, cores de blocos, bordas e botões.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#0B1F3A]">Fonte do biosite</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => {
                      const selected = (biosite.appearance.fontFamily || FONT_OPTIONS[0].value) === font.value;
                      return <button key={font.name} type="button" onClick={() => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, fontFamily: font.value } })} style={{ fontFamily: font.value }} className={`rounded-xl border px-3 py-2.5 text-left text-sm ${selected ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]' : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#0B1F3A]'}`}>{font.name}</button>;
                    })}
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#EEF3F8] pt-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A]">Imagem ou vídeo de fundo</label>
                    <p className="text-[11px] text-[#667085]">A mídia ocupa toda a página e mantém o conteúdo legível.</p>
                  </div>
                  <ImageUploader label="Mídia vertical" value={biosite.appearance.backgroundMediaUrl || ''} acceptVideo aspectRatio="wide" maxDimension={1920} onChange={(url) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaUrl: url, backgroundMediaType: /\.(mp4|webm)(\?|$)/i.test(url) ? 'video' : 'image' } })} />
                  {biosite.appearance.backgroundMediaUrl && (<>
                    <div><label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">Posição</label><select value={biosite.appearance.backgroundMediaPosition || 'center'} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaPosition: e.target.value as 'top' | 'center' | 'bottom' } })} className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] px-3 py-2 text-xs"><option value="top">Topo</option><option value="center">Centro</option><option value="bottom">Fundo</option></select></div>
                    <div><label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">Escala</label><select value={biosite.appearance.backgroundMediaScale || 'cover'} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaScale: e.target.value as 'cover' | 'contain' } })} className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] px-3 py-2 text-xs"><option value="cover">Preencher página</option><option value="contain">Mostrar mídia completa</option></select></div>
                    <div><label className="block text-[11px] font-semibold text-[#0B1F3A]">Intensidade: {biosite.appearance.backgroundMediaOpacity ?? 100}%</label><input type="range" min={10} max={100} value={biosite.appearance.backgroundMediaOpacity ?? 100} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaOpacity: Number(e.target.value) } })} className="w-full" /></div>
                    <div><label className="block text-[11px] font-semibold text-[#0B1F3A]">Escurecimento: {biosite.appearance.backgroundMediaOverlay ?? 20}%</label><input type="range" min={0} max={90} value={biosite.appearance.backgroundMediaOverlay ?? 20} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaOverlay: Number(e.target.value) } })} className="w-full" /></div>
                    <div><label className="block text-[11px] font-semibold text-[#0B1F3A]">Desfoque: {biosite.appearance.backgroundMediaBlur ?? 0}px</label><input type="range" min={0} max={20} value={biosite.appearance.backgroundMediaBlur ?? 0} onChange={(e) => triggerAutoSave({ ...biosite, appearance: { ...biosite.appearance, backgroundMediaBlur: Number(e.target.value) } })} className="w-full" /></div>
                  </>)}
                </div>

                {/* 1. PALETAS & TEMAS PRONTOS (NÃO-BRANCOS) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Temas & Paletas Prontas (Especiais Não-Brancas)
                    </label>
                    <span className="text-[10px] text-[#155EEF] font-semibold">1-clique para aplicar</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.values(THEME_PRESETS).map((preset) => {
                      const isSelected = biosite.appearance?.themePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                themePreset: preset.id,
                                backgroundType: preset.backgroundType,
                                backgroundColor: preset.backgroundColor,
                                backgroundGradient: preset.backgroundGradient,
                                cardBgColor: preset.cardBgColor,
                                cardBorderColor: preset.cardBorderColor,
                                cardBorderStyle: preset.cardBorderStyle,
                                textColor: preset.textColor,
                                textSecondaryColor: preset.textSecondaryColor,
                                accentColor: preset.accentColor,
                                primaryColor: preset.primaryColor,
                                buttonBgColor: preset.buttonBgColor,
                                buttonTextColor: preset.buttonTextColor,
                                buttonEffect: preset.buttonEffect,
                                buttonGradient: preset.buttonGradient,
                                buttonStyle: preset.buttonStyle,
                                catalogLayout: preset.catalogLayout,
                              },
                            })
                          }
                          className={`rounded-xl border p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-[#155EEF] ring-2 ring-[#155EEF]/20 bg-blue-50/40 shadow-xs'
                              : 'border-[#EEF3F8] bg-[#F7F9FC] hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[#0B1F3A]">{preset.name}</span>
                            {isSelected && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#155EEF] bg-blue-100/70 px-1.5 py-0.5 rounded">
                                <Check className="h-3 w-3" /> Ativo
                              </span>
                            )}
                          </div>

                          {/* Mini visual swatch bar */}
                          <div
                            style={{ background: preset.backgroundGradient }}
                            className="h-7 w-full rounded-lg border border-white/10 p-1 flex items-center justify-between shadow-inner mb-1.5 overflow-hidden"
                          >
                            <div
                              style={{ backgroundColor: preset.cardBgColor, borderColor: preset.cardBorderColor }}
                              className="h-full px-2 rounded flex items-center border text-[9px] font-bold"
                            >
                              <span style={{ color: preset.textColor }}>Card</span>
                            </div>
                            <div
                              style={{ backgroundColor: preset.buttonBgColor, color: preset.buttonTextColor }}
                              className="h-4 px-2 rounded-full flex items-center text-[8px] font-bold shadow-xs"
                            >
                              Botão
                            </div>
                          </div>

                          <p className="text-[10px] text-[#667085] leading-tight line-clamp-2">
                            {preset.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FORMATOS DO CATÁLOGO DE PRODUTOS */}
                <div className="pt-2 border-t border-[#EEF3F8]">
                  <div className="mb-2">
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Formato de Exibição do Catálogo
                    </label>
                    <p className="text-[11px] text-[#667085]">
                      Escolha como seus produtos e serviços serão apresentados aos clientes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      {
                        id: 'carousel' as CatalogLayout,
                        title: 'Carrossel Horizontal (1 Linha)',
                        desc: 'Blocos de produtos em uma linha contínua deslizável.',
                        icon: Columns,
                        badge: 'Pedido',
                      },
                      {
                        id: 'grid' as CatalogLayout,
                        title: 'Grade em 2 Colunas',
                        desc: 'Cards visuais lado a lado (estilo vitrine de loja).',
                        icon: LayoutGrid,
                        badge: 'Popular',
                      },
                      {
                        id: 'list' as CatalogLayout,
                        title: 'Lista Horizontal',
                        desc: 'Linhas com foto quadrada, detalhes e preço à direita.',
                        icon: LayoutList,
                      },
                      {
                        id: 'cards' as CatalogLayout,
                        title: 'Vitrine / Cards Grandes',
                        desc: 'Foto panorâmica em alta definição e botão largo.',
                        icon: Maximize2,
                      },
                    ].map((fmt) => {
                      const isChosen =
                        (biosite.appearance?.catalogLayout || 'list') === fmt.id;
                      const Icon = fmt.icon;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                catalogLayout: fmt.id,
                              },
                            })
                          }
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                            isChosen
                              ? 'border-[#155EEF] bg-blue-50/50 shadow-2xs font-semibold'
                              : 'border-[#EEF3F8] bg-[#F7F9FC] hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              isChosen ? 'bg-[#155EEF] text-white' : 'bg-white text-[#667085] border border-[#EEF3F8]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#0B1F3A]">{fmt.title}</span>
                              {fmt.badge && (
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                  {fmt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#667085] mt-0.5 leading-tight">{fmt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. FUNDO DA PÁGINA (DEGRADÊ SUAVE VS SÓLIDO) */}
                <div className="pt-2 border-t border-[#EEF3F8] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1F3A]">Fundo da Página</label>
                      <p className="text-[11px] text-[#667085]">
                        Escolha um degradê suave elegante ou uma cor sólida profunda.
                      </p>
                    </div>

                    {/* Toggle gradient vs solid */}
                    <div className="flex items-center bg-[#F7F9FC] border border-[#EEF3F8] rounded-lg p-0.5 text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() =>
                          triggerAutoSave({
                            ...biosite,
                            appearance: {
                              ...biosite.appearance,
                              backgroundType: 'gradient',
                            },
                          })
                        }
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          (biosite.appearance?.backgroundType || 'gradient') === 'gradient'
                            ? 'bg-white text-[#155EEF] shadow-2xs font-bold'
                            : 'text-[#667085]'
                        }`}
                      >
                        Degradê Suave
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          triggerAutoSave({
                            ...biosite,
                            appearance: {
                              ...biosite.appearance,
                              backgroundType: 'solid',
                            },
                          })
                        }
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          biosite.appearance?.backgroundType === 'solid'
                            ? 'bg-white text-[#155EEF] shadow-2xs font-bold'
                            : 'text-[#667085]'
                        }`}
                      >
                        Cor Sólida
                      </button>
                    </div>
                  </div>

                  {(biosite.appearance?.backgroundType || 'gradient') === 'gradient' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1.5">
                        Paleta de Degradês Suaves
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {GRADIENT_PALETTES.map((grad, i) => {
                          const isCur = biosite.appearance?.backgroundGradient === grad.value;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                triggerAutoSave({
                                  ...biosite,
                                  appearance: {
                                    ...biosite.appearance,
                                    backgroundType: 'gradient',
                                    backgroundGradient: grad.value,
                                  },
                                })
                              }
                              className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                                isCur
                                  ? 'border-[#155EEF] ring-1 ring-[#155EEF] bg-blue-50/50'
                                  : 'border-[#EEF3F8] bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div
                                style={{ background: grad.value }}
                                className="h-6 w-8 rounded-lg shrink-0 border border-white/20 shadow-xs"
                              />
                              <span className="text-xs font-semibold text-[#0B1F3A] truncate">
                                {grad.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom CSS gradient text */}
                      <div className="mt-2.5">
                        <label className="block text-[10px] font-semibold text-[#667085] mb-1">
                          Código CSS do Gradiente Personalizado (opcional)
                        </label>
                        <input
                          type="text"
                          value={biosite.appearance?.backgroundGradient || ''}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                backgroundType: 'gradient',
                                backgroundGradient: e.target.value,
                              },
                            })
                          }
                          placeholder="linear-gradient(160deg, #0A1128 0%, #122045 100%)"
                          className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-1.5 px-3 text-xs font-mono text-[#0B1F3A]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1.5">
                        Paleta de Cores Sólidas
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {SOLID_PALETTES.map((s, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              triggerAutoSave({
                                ...biosite,
                                appearance: {
                                  ...biosite.appearance,
                                  backgroundType: 'solid',
                                  backgroundColor: s.value,
                                },
                              })
                            }
                            style={{ backgroundColor: s.value }}
                            title={s.label}
                            className={`h-7 w-7 rounded-full border border-white/20 shadow-xs transition-transform ${
                              biosite.appearance?.backgroundColor === s.value
                                ? 'ring-2 ring-offset-2 ring-[#155EEF] scale-110'
                                : ''
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={biosite.appearance?.backgroundColor || '#0A1128'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                backgroundType: 'solid',
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          className="h-8 w-12 rounded-lg border border-[#EEF3F8] cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={biosite.appearance?.backgroundColor || '#0A1128'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                backgroundType: 'solid',
                                backgroundColor: e.target.value,
                              },
                            })
                          }
                          placeholder="#0A1128"
                          className="w-32 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-1.5 px-3 text-xs font-mono text-[#0B1F3A]"
                        />
                        <span className="text-[11px] text-[#667085]">Cor personalizada</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. CARDS & BORDAS DOS BLOCOS */}
                <div className="pt-2 border-t border-[#EEF3F8] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Cards, Blocos & Bordas
                    </label>
                    <p className="text-[11px] text-[#667085]">
                      Personalize a cor interna dos cartões e o tom das bordas.
                    </p>
                  </div>

                  {/* Cor de Fundo do Card */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1.5">
                      Cor de Fundo dos Cards
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {CARD_BG_PALETTES.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                cardBgColor: c.value,
                              },
                            })
                          }
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                          className={`h-7 w-7 rounded-lg border border-white/20 shadow-xs transition-transform ${
                            biosite.appearance?.cardBgColor === c.value
                              ? 'ring-2 ring-offset-2 ring-[#155EEF] scale-110'
                              : ''
                          }`}
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-1">
                        <input
                          type="color"
                          value={biosite.appearance?.cardBgColor?.startsWith('#') ? biosite.appearance.cardBgColor : '#122045'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                cardBgColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <span className="text-[10px] text-[#667085]">Custom</span>
                      </div>
                    </div>
                  </div>

                  {/* Cor da Borda do Card */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1.5">
                      Cor da Borda dos Cards
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {BORDER_COLOR_PALETTES.map((b, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                cardBorderColor: b.value,
                              },
                            })
                          }
                          style={{ backgroundColor: b.value }}
                          title={b.label}
                          className={`h-7 w-7 rounded-lg border border-white/20 shadow-xs transition-transform ${
                            biosite.appearance?.cardBorderColor === b.value
                              ? 'ring-2 ring-offset-2 ring-[#155EEF] scale-110'
                              : ''
                          }`}
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-1">
                        <input
                          type="color"
                          value={biosite.appearance?.cardBorderColor?.startsWith('#') ? biosite.appearance.cardBorderColor : '#1E356D'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                cardBorderColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <span className="text-[10px] text-[#667085]">Custom</span>
                      </div>
                    </div>
                  </div>

                  {/* Estilo da Borda */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                      Espessura da Borda
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'none' as CardBorderStyle, label: 'Sem borda' },
                        { id: 'subtle' as CardBorderStyle, label: 'Borda sutil (1px)' },
                        { id: 'prominent' as CardBorderStyle, label: 'Borda nítida (2px)' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                cardBorderStyle: st.id,
                              },
                            })
                          }
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            (biosite.appearance?.cardBorderStyle || 'subtle') === st.id
                              ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                              : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. BOTÕES DE AÇÃO & EFEITOS */}
                <div className="pt-2 border-t border-[#EEF3F8] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Botões de Ação & CTA
                    </label>
                    <p className="text-[11px] text-[#667085]">
                      Configure formatos, cor de preenchimento, degradê no botão e cor do texto.
                    </p>
                  </div>

                  {/* Formato dos Botões */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                      Formato dos Botões
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'rounded', label: 'Arredondado' },
                        { id: 'pill', label: 'Pílula (Oval)' },
                        { id: 'square', label: 'Reto' },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                buttonStyle: btn.id as ButtonStyle,
                              },
                            })
                          }
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            (biosite.appearance?.buttonStyle || 'rounded') === btn.id
                              ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                              : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Efeito do Botão */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                      Efeito Visual do Botão
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'solid' as ButtonEffect, label: 'Sólido' },
                        { id: 'gradient' as ButtonEffect, label: 'Degradê Suave' },
                        { id: 'outline' as ButtonEffect, label: 'Contorno (Vazado)' },
                      ].map((eff) => (
                        <button
                          key={eff.id}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                buttonEffect: eff.id,
                              },
                            })
                          }
                          className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                            (biosite.appearance?.buttonEffect || 'gradient') === eff.id
                              ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                              : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                          }`}
                        >
                          {eff.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cor do Botão */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1.5">
                      Cor Principal do Botão
                    </label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {BUTTON_BG_PALETTES.map((btnColor, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                primaryColor: btnColor.value,
                                buttonBgColor: btnColor.value,
                                buttonGradient: `linear-gradient(135deg, ${btnColor.value} 0%, #0040C1 100%)`,
                              },
                            })
                          }
                          style={{ backgroundColor: btnColor.value }}
                          title={btnColor.label}
                          className={`h-7 w-7 rounded-full shadow-xs transition-transform ${
                            (biosite.appearance?.buttonBgColor || biosite.appearance?.primaryColor) === btnColor.value
                              ? 'ring-2 ring-offset-2 ring-[#155EEF] scale-110'
                              : ''
                          }`}
                        />
                      ))}
                      <div className="flex items-center gap-1 ml-1">
                        <input
                          type="color"
                          value={biosite.appearance?.buttonBgColor || '#38BDF8'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                primaryColor: e.target.value,
                                buttonBgColor: e.target.value,
                                buttonGradient: `linear-gradient(135deg, ${e.target.value} 0%, #0040C1 100%)`,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <span className="text-[10px] text-[#667085]">Personalizado</span>
                      </div>
                    </div>
                  </div>

                  {/* Cor do Texto do Botão */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                      Cor do Texto do Botão
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          triggerAutoSave({
                            ...biosite,
                            appearance: {
                              ...biosite.appearance,
                              buttonTextColor: '#FFFFFF',
                            },
                          })
                        }
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                          (biosite.appearance?.buttonTextColor || '#FFFFFF') === '#FFFFFF'
                            ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                            : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full bg-white border shadow-xs" />
                        Texto Branco
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          triggerAutoSave({
                            ...biosite,
                            appearance: {
                              ...biosite.appearance,
                              buttonTextColor: '#070D1F',
                            },
                          })
                        }
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                          biosite.appearance?.buttonTextColor === '#070D1F'
                            ? 'border-[#155EEF] bg-blue-50 text-[#155EEF]'
                            : 'border-[#EEF3F8] bg-[#F7F9FC] text-[#667085]'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full bg-slate-900 shadow-xs" />
                        Texto Escuro
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6. TIPOGRAFIA & DESTAQUES */}
                <div className="pt-2 border-t border-[#EEF3F8] space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0B1F3A]">
                      Tipografia & Cores de Texto
                    </label>
                    <p className="text-[11px] text-[#667085]">
                      Controle as cores dos títulos, textos secundários e preços.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Título */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                        Título Principal
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={biosite.appearance?.textColor || '#FFFFFF'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                textColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <input
                          type="text"
                          value={biosite.appearance?.textColor || '#FFFFFF'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                textColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-1 px-2 text-xs font-mono text-[#0B1F3A]"
                        />
                      </div>
                    </div>

                    {/* Texto secundário */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                        Texto Secundário
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={biosite.appearance?.textSecondaryColor || '#94A3B8'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                textSecondaryColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <input
                          type="text"
                          value={biosite.appearance?.textSecondaryColor || '#94A3B8'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                textSecondaryColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-1 px-2 text-xs font-mono text-[#0B1F3A]"
                        />
                      </div>
                    </div>

                    {/* Cor de Preço / Destaque */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1F3A] mb-1">
                        Preço & Destaques
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={biosite.appearance?.accentColor || '#38BDF8'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                accentColor: e.target.value,
                              },
                            })
                          }
                          className="h-7 w-7 rounded-lg cursor-pointer p-0.5 border border-[#EEF3F8]"
                        />
                        <input
                          type="text"
                          value={biosite.appearance?.accentColor || '#38BDF8'}
                          onChange={(e) =>
                            triggerAutoSave({
                              ...biosite,
                              appearance: {
                                ...biosite.appearance,
                                accentColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-1 px-2 text-xs font-mono text-[#0B1F3A]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER SMARTPHONE LIVE PREVIEW */}
        <div
          className={`flex-1 bg-[#F0F4F8] p-4 sm:p-8 flex flex-col items-center justify-center overflow-y-auto ${
            mobileView === 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="relative mx-auto w-[375px] max-w-full shrink-0 rounded-[48px] border-[10px] border-[#0B1F3A] bg-white shadow-2xl overflow-hidden">
            {/* Phone speaker notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 h-4 w-28 rounded-full bg-[#0B1F3A]" />

            {/* Inner viewport */}
            <div className="h-[min(720px,calc(100vh-150px))] min-h-[560px] w-full overflow-y-auto overflow-x-hidden pt-6 scrollbar-none">
              <BiositeViewer
                biosite={biosite}
                isSimulator={true}
                onOpenQrCode={() => setShowQrModal(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-[#EEF3F8]">
            <h3 className="text-sm font-bold text-[#0B1F3A]">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <form onSubmit={handleSaveCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0B1F3A] mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={categoryNameInput}
                  onChange={(e) => setCategoryNameInput(e.target.value)}
                  placeholder="Ex: Cortes, Bebidas, Sobremesas..."
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#667085] hover:bg-[#F7F9FC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#155EEF] px-4 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#EEF3F8] max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-bold text-[#0B1F3A]">
              {editingProduct ? 'Editar Item do Catálogo' : 'Novo Item do Catálogo'}
            </h3>
            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                  Nome do produto/serviço *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Corte Clássico Masculino"
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">
                    Preço ({CURRENCIES.find((c) => c.code === (biosite.appearance.currency || 'AOA'))?.symbol}) *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Ex: 6000"
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Categoria</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden"
                  >
                    <option value="">Sem categoria</option>
                    {biosite.catalogCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({ ...productForm, description: e.target.value })
                  }
                  placeholder="Descreva detalhes, ingredientes ou o que está incluído..."
                  className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <ImageUploader
                  label="Foto ou vídeo do produto (opcional)"
                  acceptVideo
                  value={productForm.imageUrl}
                  onChange={(newUrl) => setProductForm({ ...productForm, imageUrl: newUrl })}
                  description="Imagem (PNG, JPG) ou vídeo curto (MP4). O vídeo toca em silêncio e em repetição."
                  aspectRatio="square"
                  maxDimension={800}
                  placeholderUrl="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Ação do Botão (CTA)</label>
                  <select
                    value={productForm.ctaType}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        ctaType: e.target.value as 'whatsapp' | 'appointment' | 'info',
                      })
                    }
                    className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2 px-2.5 text-xs text-[#0B1F3A]"
                  >
                    <option value="whatsapp">Pedir pelo WhatsApp</option>
                    <option value="appointment">Agendar horário</option>
                    <option value="info">Solicitar informações</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isFeatured: e.target.checked })
                      }
                      className="rounded text-[#155EEF]"
                    />
                    <span>Destacar item</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EEF3F8]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-[#667085] hover:bg-[#F7F9FC]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#155EEF] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#124bbf]"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PUBLISHED SUCCESS */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#EEF3F8] text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 ring-8 ring-emerald-50/50">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
              <span>Publicado em Produção</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#0B1F3A]">Seu biosite saiu do rascunho e está no ar!</h3>
            <p className="mt-1 text-xs text-[#667085]">
              A página pública agora está disponível em produção e pronta para receber seus clientes e divulgar seus links e catálogo.
            </p>

            <div className="my-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs font-bold text-[#155EEF] flex items-center justify-between gap-2">
              <span className="truncate select-all text-left">{publicUrl}</span>
              <button
                onClick={async () => {
                  await copyToClipboard(publicUrl);
                  setCopiedNotice(true);
                  setTimeout(() => setCopiedNotice(false), 2500);
                }}
                className="shrink-0 text-[11px] font-bold text-[#155EEF] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded border border-emerald-200 shadow-2xs"
              >
                {copiedNotice ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>

            {popupBlockedNotice && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900">
                <p className="font-bold">O navegador bloqueou a abertura da nova aba.</p>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  Clique no botão verde abaixo para <strong>Ver a Página Agora</strong> na mesma tela ou copie o link.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {/* PRIMARY ACTION: Ver página agora */}
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  onNavigate(`/b/${biosite.slug}`);
                }}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Página Agora na Tela</span>
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const opened = openExternalUrl(publicUrl, () => setPopupBlockedNotice(true));
                    if (!opened) {
                      setPopupBlockedNotice(true);
                    }
                  }}
                  className="rounded-xl border border-[#EEF3F8] bg-white py-2.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#667085]" />
                  <span>Nova Aba</span>
                </button>
                <button
                  onClick={async () => {
                    await copyToClipboard(publicUrl);
                    setCopiedNotice(true);
                    setTimeout(() => setCopiedNotice(false), 2500);
                  }}
                  className="rounded-xl border border-[#EEF3F8] bg-white py-2.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                >
                  {copiedNotice ? '✓ Copiado!' : 'Copiar link'}
                </button>
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setShowQrModal(true);
                  }}
                  className="rounded-xl border border-[#EEF3F8] bg-white py-2.5 text-xs font-bold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                >
                  QR Code
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPublishModal(false)}
              className="mt-4 text-xs font-semibold text-[#667085] hover:text-[#0B1F3A] cursor-pointer"
            >
              Continuar editando
            </button>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        url={publicUrl}
        businessName={biosite.name}
      />
    </div>
  );
};
