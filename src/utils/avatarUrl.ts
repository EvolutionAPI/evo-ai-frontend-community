const rawAuthApiBaseURL =
  import.meta.env.VITE_AUTH_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3030';

const authOrigin = rawAuthApiBaseURL.replace(/\/api\/v\d+$/i, '').replace(/\/$/, '');

export const normalizeAvatarUrl = (url?: string | null): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http') || trimmed.startsWith('//')) {
    return trimmed;
  }

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${authOrigin}${trimmed}`;
  }

  return `${authOrigin}/${trimmed}`;
};
