import type { UserData } from "../api/types";
import type { ChatsState } from "../store/chatsSlice";

const KEYS = {
  USER_DATA: 'green-api_user_data',
  CHATS_STATE: 'green-api_chats_state',
} as const;

function getItem<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  localStorage.removeItem(key);
}

export function loadData<T>(): T | null {
  return getItem<T>(KEYS.USER_DATA);
}

export function saveData(data: UserData): void {
  setItem(KEYS.USER_DATA, data);
}

export function clearData(): void {
  removeItem(KEYS.USER_DATA);
}

export function loadChatsState<T>(): T | null {
  return getItem<T>(KEYS.CHATS_STATE);
}

export function saveChatsState(state: ChatsState): void {
  setItem(KEYS.CHATS_STATE, state);
}

export function clearChatsState(): void {
  removeItem(KEYS.CHATS_STATE);
}