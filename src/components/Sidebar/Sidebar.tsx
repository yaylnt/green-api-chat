import { useState } from 'react';
import { ChatCard } from '../ChatCard';
import { Button } from '../Button/Button';
import { NewChatModal } from '../NewChatModal/NewChatModal';
import styles from './Sidebar.module.css';

interface Chat {
  chatId: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (phoneNumber: string) => void;
}

export function Sidebar({ chats, activeChatId, onSelectChat, onCreateChat }: SidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateChat = (phoneNumber: string) => {
    onCreateChat(phoneNumber);
    setIsModalOpen(false);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>Чаты</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} aria-label="Новый чат">+</Button>
      </div>
      <div className={styles.chatsList}>
        {chats.length === 0 ? (
          <div className={styles.empty}>
            <p>Нет чатов</p>
            <p className={styles.hint}>Нажмите «+» чтобы создать новый чат</p>
          </div>
        ) : chats.map((chat) => (
          <ChatCard
            key={chat.chatId}
            chatId={chat.chatId}
            lastMessage={chat.lastMessage}
            lastMessageTime={chat.lastMessageTime}
            isActive={activeChatId === chat.chatId}
            onClick={() => onSelectChat(chat.chatId)}
          />
        ))}
      </div>
      <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreateChat} />
    </aside>
  );
}
