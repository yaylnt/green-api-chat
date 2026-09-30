import { configureStore } from '@reduxjs/toolkit';
import chatsReducer from './chatsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { saveChatsState } from '../utils/storage';

export const store = configureStore({
  reducer: { chats: chatsReducer },
});

// Сохраняем в localStorage при каждом изменении стейта.
store.subscribe(() => {
  saveChatsState(store.getState().chats);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();