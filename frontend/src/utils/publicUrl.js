/**
 * Prefix a public path with Vite's BASE_URL so assets work when the app is
 * hosted under a subpath (e.g. GitHub Pages or a nested Static Web App route).
 * API returns paths like "/images/dish.jpg" — use this for <img src>.
 */
export function publicUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!normalizedBase) return normalizedPath;
  return `${normalizedBase}${normalizedPath}`;
}
