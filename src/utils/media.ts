export type ResolvedMedia =
  | { kind: 'image'; src: string }
  | { kind: 'video'; src: string }
  | { kind: 'embed'; src: string; vertical?: boolean }
  | { kind: 'none'; src: '' };

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i;

/** Turns any pasted link (direct file, YouTube, Vimeo, Drive, Dropbox, Imgur) into something the browser can display. */
export function resolveMedia(raw?: string, hint?: 'image' | 'video'): ResolvedMedia {
  const url = (raw || '').trim();
  if (!url) return { kind: 'none', src: '' };
  if (url.startsWith('data:video')) return { kind: 'video', src: url };
  if (url.startsWith('data:') || url.startsWith('blob:')) return { kind: hint === 'video' ? 'video' : 'image', src: url };

  let u: URL;
  try { u = new URL(url.startsWith('//') ? `https:${url}` : url); } catch { return { kind: 'image', src: url }; }
  const host = u.hostname.replace(/^www\.|^m\./, '');

  // YouTube
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    let id = '';
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/embed/') || u.pathname.startsWith('/live/')) id = u.pathname.split('/')[2];
    else id = u.searchParams.get('v') || '';
    if (id) return { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0`, vertical: u.pathname.startsWith('/shorts/') };
  }
  // Vimeo
  if (host.endsWith('vimeo.com')) {
    const id = u.pathname.split('/').filter(Boolean).find((p) => /^\d+$/.test(p));
    if (id) return { kind: 'embed', src: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&playsinline=1` };
  }
  // Google Drive
  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const id = u.pathname.match(/\/d\/([^/]+)/)?.[1] || u.searchParams.get('id');
    if (id) {
      if (hint === 'video') return { kind: 'embed', src: `https://drive.google.com/file/d/${id}/preview` };
      return { kind: 'image', src: `https://lh3.googleusercontent.com/d/${id}=w2000` };
    }
  }
  // Dropbox
  if (host.endsWith('dropbox.com')) {
    u.searchParams.delete('dl');
    u.searchParams.set('raw', '1');
    const src = u.toString();
    return { kind: VIDEO_EXT.test(u.pathname) || hint === 'video' ? 'video' : 'image', src };
  }
  // Imgur page links
  if (host === 'imgur.com' && /^\/[a-zA-Z0-9]+$/.test(u.pathname)) {
    return { kind: 'image', src: `https://i.imgur.com${u.pathname}.jpg` };
  }

  if (VIDEO_EXT.test(u.pathname) || hint === 'video') return { kind: 'video', src: url };
  return { kind: 'image', src: url };
}

export const isVideoMedia = (url?: string, hint?: 'image' | 'video') => {
  const k = resolveMedia(url, hint).kind;
  return k === 'video' || k === 'embed';
};
