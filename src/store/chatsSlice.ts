import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MessageNotification } from '../api/types';
import { loadChatsState } from '../utils/storage';

export interface ChatsState {
  // Ключ - chatId, значение - массив сообщений этого чата.
  messagesByChat: Record<string, MessageNotification[]>;
  activeChatId: string | null;
}

function loadInitialState(): ChatsState {
  return loadChatsState<ChatsState>() ?? { messagesByChat: {}, activeChatId: null };
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState: loadInitialState(),
  reducers: {
    // Добавить новое сообщение
    messageAdded(state, action: PayloadAction<MessageNotification>) {
      const { chatId, id } = action.payload;
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      // если сообщение с таким id уже есть, второй раз не добавляем
      if (state.messagesByChat[chatId].some((m) => m.id === id)) return;
      state.messagesByChat[chatId].push(action.payload);
    },

    chatCreated(state, action: PayloadAction<{ chatId: string }>) {
      const { chatId } = action.payload;
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
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