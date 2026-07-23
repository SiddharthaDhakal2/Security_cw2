// Utility to get the full image URL for backend-served images
export function getImageUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  return `${base}${path}`;
}
