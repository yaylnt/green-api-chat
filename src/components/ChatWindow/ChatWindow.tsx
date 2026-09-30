import { useEffect, useRef } from 'react';
import type { MessageNotification } from '../../api/types';
import { Message } from '../Message';
import { MessageInput } from '../MessageInput';
import styles from './ChatWindow.module.css';
import { formatPhoneNumber } from '../../utils/format';
import logoutIcon from '../../assets/logout.svg';

interface ChatWindowProps {
  chatId?: string | null;
  messages: MessageNotification[];
  isLoadingSend?: boolean;
  onSendMessage: (text: string) => void;
  onLogout: () => void;
}

export function ChatWindow({
  chatId,
  messages,
  isLoadingSend,
  onSendMessage,
  onLogout,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!chatId) {
    return (
      <div className={styles.empty}>
        <button className={styles.logoutButton} type="button" onClick={onLogout}aria-label="Logout" title="Logout">
          <img src={logoutIcon} alt="" aria-hidden="true" />
        </button>
        <div className={styles.emptyContent}>
          <p className={styles.emptyTitle}>Выберите чат</p>
          <p className={styles.emptyText}>Выберите существующий чат или создайте новый</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        <h2 className={styles.chatTitle}>{formatPhoneNumber(chatId)}</h2>
        <button className={styles.logoutButton} type="button" onClick={onLogout} aria-label="Logout" title="Logout">
          <img src={logoutIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      <div className={styles.mask} />
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyMessages}>
            <p>Нет сообщений</p>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isSent={message.direction === 'outgoing'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        disabled={!chatId}
        isLoading={isLoadingSend}
      />
    </div>
  );
}
