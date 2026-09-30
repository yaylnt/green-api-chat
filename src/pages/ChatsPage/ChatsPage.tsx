import { useEffect, useRef, useCallback, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { ChatWindow } from '../../components/ChatWindow';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { messageAdded, chatCreated, activeChatSet } from '../../store/chatsSlice';
import { sendMessage, receiveNotification, deleteNotification } from '../../api/greenApi';
import type { MessageNotification, UserData, Notification } from '../../api/types';
import { loadData } from '../../utils/storage';
import styles from './ChatsPage.module.css';

interface ChatsPageProps {
  onLogout: () => void;
}

export function ChatsPage({ onLogout }: ChatsPageProps) {
  const dispatch = useAppDispatch();
  const { messagesByChat, activeChatId } = useAppSelector((state) => state.chats);
  
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userData = loadData<UserData>();
  const pollingAbortRef = useRef<AbortController | null>(null);

  const formatChatId = (phone: string) => `${phone.replace(/\D/g, '')}@c.us`;

  // Создание нового чата
  const handleCreateChat = useCallback(
    (phoneNumber: string) => {
      dispatch(chatCreated({ chatId: phoneNumber }));
      dispatch(activeChatSet(phoneNumber));
    },
    [dispatch]
  );

  // Отправка сообщения
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeChatId || !text.trim() || !userData) return;

      setIsLoadingSend(true);
      setError(null);

      try {
        const apiChatId = formatChatId(activeChatId);
        
        // Отправляем сообщение через API
        await sendMessage(userData, apiChatId, text);

        // Создаём объект сообщения и добавляем в Redux
        const message: MessageNotification = {
          id: `${Date.now()}`,
          chatId: activeChatId,
          text,
          direction: 'outgoing',
          timestamp: Math.floor(Date.now() / 1000),
        };

        dispatch(messageAdded(message));
      } catch (err) {
        setError('Ошибка отправки сообщения');
        console.error('Ошибка отправки сообщения:', err);
      } finally {
        setIsLoadingSend(false);
      }
    },
    [activeChatId, userData, dispatch]
  );

  const processNotification = useCallback(
    (notification: Notification) => {
      if (!userData) return;
      try {
        const { body, receiptId } = notification;
        if (body.typeWebhook === 'incomingMessageReceived') {
          const { senderData, messageData } = body;
          if (messageData?.typeMessage === 'textMessage') {
            const chatId = senderData.chatId.replace('@c.us', '');
            const text = messageData.textMessageData?.textMessage || '';
            dispatch(chatCreated({ chatId }));
            dispatch(
              messageAdded({
                id: body.idMessage,
                chatId,
                text,
                direction: 'incoming',
                timestamp: body.timestamp,
              })
            );
          }
        }
        if (receiptId) {
          deleteNotification(userData, receiptId).catch((err) =>
            console.error('Ошибка удаления уведомления:', err)
          );
        }
      } catch (err) {
        console.error('Ошибка обработки уведомления:', err);
      }
    },
    [dispatch, userData]
  );

  useEffect(() => {
    if (!userData) return;

    // AbortController для текущей сессии полинга
    pollingAbortRef.current = new AbortController();
    const signal = pollingAbortRef.current.signal;

    const poll = async () => {
      try {
        const notification = await receiveNotification(userData, signal, 5);
        if (notification) {
          processNotification(notification);
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          console.error('Ошибка полинга:', err);
        }
      } finally {
        // Если полинг не был отменён, начинаем следующий запрос
        if (!signal.aborted) {
          poll();
        }
      }
    };

    poll();

    return () => {
      if (pollingAbortRef.current) {
        pollingAbortRef.current.abort();
      }
    };
  }, [userData, dispatch, processNotification]);

  if (!userData) {
    return (
      <div className={styles.error}>
        <p>Пожалуйста, авторизуйтесь</p>
      </div>
    );
  }

  // Подготовка данных для Sidebar
  const chats = Object.entries(messagesByChat).map(([chatId, messages]) => ({
    chatId,
    lastMessage: messages[messages.length - 1]?.text,
    lastMessageTime: messages[messages.length - 1]?.timestamp
      ? new Date(messages[messages.length - 1].timestamp * 1000).toISOString()
      : undefined,
  }));

  const currentMessages = activeChatId && messagesByChat[activeChatId] ? messagesByChat[activeChatId] : [];

  return (
    <div className={styles.container}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(chatId) => dispatch(activeChatSet(chatId))}
        onCreateChat={handleCreateChat}
      />

      <div className={styles.mainContent}>
        {error && (
          <div className={styles.errorBanner}>
            <p>{error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        <ChatWindow
          chatId={activeChatId}
          messages={currentMessages}
          isLoadingSend={isLoadingSend}
          onSendMessage={handleSendMessage}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
