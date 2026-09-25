/**
 * Browser navigation and clipboard utilities resilient to iframe sandboxing and popup blockers
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for iframe sandboxes or non-secure contexts
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-999999px';
    textArea.style.left = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export function openExternalUrl(
  url: string,
  onBlocked?: () => void
): boolean {
  try {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      if (onBlocked) onBlocked();
      return false;
    }
    return true;
  } catch {
    if (onBlocked) onBlocked();
    return false;
  }
}

export function getPublicBiositeUrl(slug: string): string {
  const origin = window.location.origin;
  return `${origin}/b/${slug}`;
}
