function apiBase(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (typeof configured === 'string' && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }
  return '/api';
}

export async function apiGet(path: string): Promise<unknown> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const body: unknown = await response.json();
  return body;
}
