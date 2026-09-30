import { useEffect, useCallback, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { ChatWindow } from '../../components/ChatWindow';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { messageAdded, chatCreated, activeChatSet } from '../../store/chatsSlice';
import { sendMessage, receiveNotification, deleteNotification } from '../../api/greenApi';
import type { MessageNotification, UserData, Notification } from '../../api/types';
import styles from './ChatsPage.module.css';

interface ChatsPageProps {
  userData: UserData;
  onLogout: () => void;
}

export function ChatsPage({ userData, onLogout }: ChatsPageProps) {
  const dispatch = useAppDispatch();
  const { messagesByChat, activeChatId } = useAppSelector((state) => state.chats);
  
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!activeChatId || !text.trim()) return;

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
      const { body } = notification;
      if (body.typeWebhook !== 'incomingMessageReceived') return;
      const { senderData, messageData } = body;
      if (messageData?.typeMessage !== 'textMessage') return;

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
    },
    [dispatch]
    );

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const poll = async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(userData, signal);
          if (notification) {
            processNotification(notification);
            await deleteNotification(userData, notification.receiptId);
          }
        } catch (err) {
          if (signal.aborted) return; 
          console.error('Ошибка полинга:', err);
          // пауза, чтобы при ошибке не отправлять запросы на сервер сервер без остановки
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
    };

    poll();
    return () => controller.abort();
    }, [userData, processNotification]);

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
