import type {
  UserData,
  DeleteNotificationResponse,
  Notification,
  SendMessageResponse,
  StateInstanceResponse,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number>;
  suffix?: string | number; // часть пути после токена (нужна для deleteNotification)
  signal?: AbortSignal;
};

async function request<T>(
  { idInstance, apiTokenInstance, apiUrl }: UserData,
  endpoint: string,
  { method = 'GET', body, query, suffix, signal }: RequestOptions = {}
): Promise<T | null> {
  const qs = query
    ? '?' +
      new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))
    : '';
  const tail = suffix !== undefined ? `/${suffix}` : '';
  const url = `${apiUrl}/waInstance${idInstance}/${endpoint}/${apiTokenInstance}${tail}${qs}`;

  const res = await fetch(url, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
  let message = res.statusText || `Ошибка ${res.status}`;
  if (text) {
    try {
      message = JSON.parse(text).message ?? text;
    } catch {
      // если JSON невалидный, оставляем текст как есть
      message = text;
    }
  }
  throw new ApiError(res.status, message);
}

  // receiveNotification при таймауте отдаёт пустой ответ
  if (!text || text === 'null') return null;
  return JSON.parse(text) as T;
};

export const getStateInstance = (data: UserData, signal?: AbortSignal) =>
  request<StateInstanceResponse>(data, 'getStateInstance', { signal });

export const sendMessage = (
  data: UserData,
  chatId: string,
  message: string
) =>
  request<SendMessageResponse>(data, 'sendMessage', {
    method: 'POST',
    body: { chatId, message },
  });

export const receiveNotification = (
  data: UserData,
  signal?: AbortSignal,
  receiveTimeout = 5
) =>
  request<Notification>(data, 'receiveNotification', {
    query: { receiveTimeout },
    signal,
  });

export const deleteNotification = (data: UserData, receiptId: number) =>
  request<DeleteNotificationResponse>(data, 'deleteNotification', {
    method: 'DELETE',
    suffix: receiptId,
  });