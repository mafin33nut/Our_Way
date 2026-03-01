const ENV_BASE_URL = (import.meta.env.VITE_API_URL ?? '').trim();

function runtimeDefaultBaseUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:8000';
  }

  const { protocol, hostname, host, port } = window.location;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isViteDevPort = port === '5173' || port === '4173';

  if (isLocalHost || isViteDevPort) {
    return `${protocol}//${hostname}:8000`;
  }

  return `${protocol}//${host}`;
}

function normalizeBaseUrl(raw: string, fallback: string): string {
  if (!raw) {
    return fallback;
  }

  if (typeof window === 'undefined') {
    return raw;
  }

  const pageOrigin = `${window.location.protocol}//${window.location.host}`;
  const pageIsHttps = window.location.protocol === 'https:';

  try {
    const parsed = new URL(raw, pageOrigin);

    if (pageIsHttps && parsed.protocol === 'http:') {
      // Avoid mixed content in production: use same-origin reverse proxy.
      return pageOrigin;
    }

    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    // Fallback below.
  }

  return fallback;
}

export const API_BASE_URL = normalizeBaseUrl(ENV_BASE_URL, runtimeDefaultBaseUrl());

export function resolveAbsoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && path.startsWith('http://')) {
      try {
        const parsed = new URL(path);
        const pageOrigin = `${window.location.protocol}//${window.location.host}`;
        return `${pageOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return path.replace(/^http:\/\//i, 'https://');
      }
    }
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
