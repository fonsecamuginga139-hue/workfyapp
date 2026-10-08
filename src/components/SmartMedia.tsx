import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveMedia } from '../utils/media';

interface SmartMediaProps {
  src?: string;
  alt?: string;
  hint?: 'image' | 'video';
  /** contain = whole media visible (default); cover = fills the box */
  fit?: 'contain' | 'cover';
  className?: string;
  style?: React.CSSProperties;
  controls?: boolean;
  /** When true the media keeps its natural proportion instead of filling a fixed box */
  natural?: boolean;
}

/**
 * Displays any image, video or video link fully visible and adapted to its slot.
 * With fit="contain" a soft blurred copy fills the empty space so it still looks finished.
 */
export const SmartMedia: React.FC<SmartMediaProps> = ({ src, alt = '', hint, fit = 'contain', className = '', style, controls, natural }) => {
  const [failed, setFailed] = useState<string | null>(null);
  const media = resolveMedia(src, hint);
  if (media.kind === 'none') return null;

  if (failed === media.src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${natural ? 'aspect-video w-full' : ''} ${className}`} style={style} role="img" aria-label="Mídia indisponível">
        <ImageOff className="h-5 w-5" />
      </div>
    );
  }

  if (media.kind === 'embed') {
    return (
      <div className={`relative overflow-hidden bg-black ${natural ? (media.vertical ? 'aspect-[9/16] w-full' : 'aspect-video w-full') : ''} ${className}`} style={style}>
        <iframe src={media.src} title={alt || 'Vídeo'} className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
      </div>
    );
  }

  const onError = () => setFailed(media.src);

  if (natural) {
    return media.kind === 'video'
      ? <video src={media.src} className={`block h-auto w-full ${className}`} style={style} autoPlay={!controls} muted={!controls} loop={!controls} controls={controls} playsInline preload="metadata" onError={onError} />
      : <img src={media.src} alt={alt} className={`block h-auto w-full ${className}`} style={style} loading="lazy" referrerPolicy="no-referrer" onError={onError} />;
  }

  const fill = 'absolute inset-0 h-full w-full';
  const main = media.kind === 'video'
    ? <video src={media.src} className={fill} style={{ objectFit: fit }} autoPlay={!controls} muted={!controls} loop={!controls} controls={controls} playsInline preload="metadata" onError={onError} aria-label={alt} />
    : <img src={media.src} alt={alt} className={fill} style={{ objectFit: fit }} loading="lazy" referrerPolicy="no-referrer" onError={onError} />;

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {fit === 'contain' && media.kind === 'image' && (
        <img src={media.src} alt="" aria-hidden="true" className={`${fill} scale-110 object-cover opacity-60 blur-xl`} referrerPolicy="no-referrer" />
      )}
      {fit === 'contain' && media.kind === 'video' && <div className={`${fill} bg-black`} />}
      {main}
    </div>
  );
};
