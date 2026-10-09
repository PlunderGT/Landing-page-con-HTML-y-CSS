const BASE = 'http://localhost:3000';

export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
}

export class ApiError extends Error {
  status: number;
  messages: string[];
  constructor(status: number, messages: string[]) {
    super(messages.join(', '));
    this.status = status;
    this.messages = messages;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg: string[] = Array.isArray(body.message) ? body.message : [body.message ?? res.statusText];
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  list: () => request<Task[]>('/tasks'),
  create: (data: Partial<Task>) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
