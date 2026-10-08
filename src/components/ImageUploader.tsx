import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import { SmartMedia } from './SmartMedia';
import { isVideoMedia } from '../utils/media';
import { Upload, Link2, X, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  description?: string;
  aspectRatio?: 'square' | 'wide' | 'auto';
  maxDimension?: number;
  placeholderUrl?: string;
  acceptVideo?: boolean;
}

/**
 * Optimizes/downscales uploaded image using HTML5 Canvas
 * to ensure fast local storage, responsive loading and memory efficiency.
 */
const optimizeImageFile = (file: File, maxDim: number = 1000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o ficheiro'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if original is PNG, otherwise high-quality JPEG
        const isPng = file.type === 'image/png';
        const outputType = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, 0.85);
        resolve(dataUrl);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  description,
  aspectRatio = 'square',
  maxDimension = 1000,
  placeholderUrl = 'https://...',
  acceptVideo = true,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    const safeImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const safeVideoTypes = ['video/mp4', 'video/webm'];
    if (!safeImageTypes.includes(file.type) && !(acceptVideo && safeVideoTypes.includes(file.type))) {
      setErrorMessage(acceptVideo ? 'Selecione PNG, JPG, WEBP, MP4 ou WEBM.' : 'Selecione uma imagem PNG, JPG ou WEBP.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const isVideo = file.type.startsWith('video/');
      if (isVideo && file.size > 35 * 1024 * 1024) throw new Error('Vídeo demasiado grande (máx. 35 MB).');
      if (!isVideo && file.size > 15 * 1024 * 1024) throw new Error('Imagem demasiado grande (máx. 15 MB).');
      const blob = isVideo ? file : await (await fetch(await optimizeImageFile(file, maxDimension))).blob();
      const ext = isVideo ? (file.type === 'video/webm' ? 'webm' : 'mp4') : blob.type === 'image/png' ? 'png' : 'jpg';
      const url = await StorageService.uploadImage(blob, ext);
      onChange(url);
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message.includes('máx') ? err.message : 'Erro ao enviar a imagem. Tente novamente ou use um link.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasValue = Boolean(value && value.trim().length > 0);
  const valueIsVideo = isVideoMedia(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#0B1F3A]">{label}</label>

        {/* MODE SWITCHER */}
        <div className="flex items-center bg-[#F7F9FC] border border-[#EEF3F8] rounded-lg p-0.5 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-[#155EEF] shadow-2xs font-bold'
                : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            <Upload className="h-2.5 w-2.5" />
            Galeria / Arquivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-[#155EEF] shadow-2xs font-bold'
                : 'text-[#667085] hover:text-[#0B1F3A]'
            }`}
          >
            <Link2 className="h-2.5 w-2.5" />
            Link (URL)
          </button>
        </div>
      </div>

      {description && <p className="text-[11px] text-[#667085]">{description}</p>}

      {/* ACTIVE PREVIEW IF PRESENT */}
      {hasValue ? (
        <div className="relative rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] p-2 flex items-center gap-3">
          <div
            className={`relative overflow-hidden rounded-lg bg-white border border-[#EEF3F8] shrink-0 ${
              aspectRatio === 'wide' ? 'w-24 h-14' : 'w-14 h-14'
            }`}
          >
            <SmartMedia src={value} className="h-full w-full" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#0B1F3A] truncate">
              {valueIsVideo ? 'Vídeo' : value?.startsWith('data:') ? 'Ficheiro carregado' : 'Link externo'}
            </p>
            <p className="text-[10px] text-[#667085] truncate">
              {value?.startsWith('data:') ? 'Arquivo pronto e otimizado' : value}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {mode === 'upload' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-lg border border-[#EEF3F8] bg-white px-2 py-1 text-[11px] font-semibold text-[#0B1F3A] hover:bg-slate-50 transition-colors"
                title="Trocar imagem"
              >
                <RefreshCw className="h-3 w-3 text-[#155EEF]" />
                <span className="hidden sm:inline">Trocar</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleRemove}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#EEF3F8] bg-white text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remover imagem"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* NO VALUE: RENDER UPLOAD ZONE OR URL INPUT ACCORDING TO MODE */
        <div>
          {mode === 'upload' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                isDragging
                  ? 'border-[#155EEF] bg-blue-50/50'
                  : 'border-[#EEF3F8] bg-[#F7F9FC] hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptVideo ? 'image/png,image/jpeg,image/webp,video/mp4,video/webm' : 'image/png,image/jpeg,image/webp'}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#155EEF]">
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-[#155EEF]" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </div>

                <div className="text-xs">
                  <span className="font-bold text-[#155EEF] hover:underline">
                    Clique para escolher da galeria
                  </span>{' '}
                  <span className="text-[#667085]">ou arraste aqui</span>
                </div>

                <p className="text-[10px] text-[#667085]">
                  {acceptVideo ? 'PNG, JPG, WEBP, MP4 ou WEBM' : 'PNG, JPG ou WEBP'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="url"
                value={value || ''}
                onChange={(e) => {
                  setErrorMessage(null);
                  onChange(e.target.value);
                }}
                placeholder={placeholderUrl}
                className="w-full rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] py-2.5 px-3 text-xs text-[#0B1F3A] focus:bg-white focus:border-[#155EEF] focus:outline-hidden transition-all"
              />
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] text-rose-600 font-medium">{errorMessage}</p>
      )}

      {/* Hidden file input for mode switching re-triggering if needed */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptVideo ? 'image/png,image/jpeg,image/webp,video/mp4,video/webm' : 'image/png,image/jpeg,image/webp'}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
