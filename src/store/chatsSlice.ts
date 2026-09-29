import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Message } from '../api/types';
import { loadChatsState } from '../utils/storage';

interface ChatsState {
  // Ключ - chatId, значение - массив сообщений этого чата.
  messagesByChat: Record<string, Message[]>;
  activeChatId: string | null;
}

// Восстанавливаем состояние из sessionStorage при загрузке,
// чтобы чаты не терялись после перезагрузки страницы
function loadInitialState(): ChatsState {
  const saved = loadChatsState<ChatsState>();

  if (!saved) {
    return { messagesByChat: {}, activeChatId: null };
  }

  return {
    messagesByChat: saved.messagesByChat ?? {},
    activeChatId: saved.activeChatId ?? null,
  };
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState: loadInitialState(),
  reducers: {
    messageAdded(state, action: PayloadAction<Message>) {
      const { chatId } = action.payload;
      state.messagesByChat[chatId].push(action.payload);
    },

    // Создать пустой чат без сообщений (когда пользователь вводит номер и жмёт "создать чат")
    chatCreated(state, action: PayloadAction<{ chatId: string }>) {
      if (!state.messagesByChat[action.payload.chatId]) {
        state.messagesByChat[action.payload.chatId] = [];
      }
    },

    activeChatSet(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload;
    },
  },
});

export const { messageAdded, chatCreated, activeChatSet } =
  chatsSlice.actions;
export default chatsSlice.reducer;