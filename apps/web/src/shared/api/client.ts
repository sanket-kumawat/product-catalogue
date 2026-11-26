export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function apiBase(): string {
  const configured = import.meta.env.VITE_API_URL;
  if (typeof configured === 'string' && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }
  return '/api';
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });
  if (!response.ok) {
    throw new ApiRequestError(response.status);
  }
  const body: unknown = await response.json();
  return body;
}

export function apiGet(path: string): Promise<unknown> {
  return request(path);
}

export function apiPost(path: string, body: unknown): Promise<unknown> {
  return request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
