import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';
import { copyToClipboard, openExternalUrl } from '../utils/browser';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  businessName: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  businessName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 260,
          margin: 2,
          color: {
            dark: '#0B1F3A',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR Code:', error);
        }
      );
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${businessName.toLowerCase().replace(/\s+/g, '-') || 'biosite'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition-all border border-[#EEF3F8]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF3F8]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3F8] text-[#155EEF]">
              <QrIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">QR Code do Biosite</h3>
              <p className="text-xs text-[#667085] truncate max-w-[220px]">{businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667085] hover:bg-[#F7F9FC] hover:text-[#101828] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-6 flex flex-col items-center justify-center">
          <div className="rounded-xl border border-[#EEF3F8] bg-white p-4 shadow-xs">
            <canvas ref={canvasRef} className="rounded-md" />
          </div>
          <p className="mt-3 text-center text-xs text-[#667085]">
            Aponte a câmera do celular para abrir a página pública do negócio.
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-[#EEF3F8] bg-[#F7F9FC] p-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#0B1F3A] truncate select-all">{url}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#155EEF] shadow-2xs border border-[#EEF3F8] hover:bg-slate-50 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#155EEF] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#124bbf] transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar PNG
          </button>
          <button
            onClick={() => {
              const opened = openExternalUrl(url);
              if (!opened) {
                window.location.href = url;
              }
            }}
            className="flex items-center justify-center rounded-xl border border-[#EEF3F8] bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-1.5 text-[#667085]" />
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};
