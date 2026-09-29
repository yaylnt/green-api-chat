// Утилиты для работы с хранилищем

const KEYS = {
  USER_DATA: 'green-api_user_data',
  CHATS_STATE: 'green-api_chats_state',
} as const;

function getItem<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem(key: string, value: unknown): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  sessionStorage.removeItem(key);
}

export function loadData<T>(): T | null {
  return getItem<T>(KEYS.USER_DATA);
}

export function saveData(creds: unknown): void {
  setItem(KEYS.USER_DATA, creds);
}

export function clearData(): void {
  removeItem(KEYS.USER_DATA);
}

export function loadChatsState<T>(): T | null {
  return getItem<T>(KEYS.CHATS_STATE);
}

export function saveChatsState(state: unknown): void {
  setItem(KEYS.CHATS_STATE, state);
}

export function clearChatsState(): void {
  removeItem(KEYS.CHATS_STATE);
}