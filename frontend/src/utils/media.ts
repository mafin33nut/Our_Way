import { resolveAbsoluteUrl } from '../config/apiBase';

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }
  return resolveAbsoluteUrl(path);
}
