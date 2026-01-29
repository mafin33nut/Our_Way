export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
