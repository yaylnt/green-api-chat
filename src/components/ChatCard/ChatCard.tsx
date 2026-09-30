import styles from './ChatCard.module.css';
import { formatPhoneNumber, formatTimeList } from '../../utils/format';

interface ChatCardProps {
  chatId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  isActive: boolean;
  onClick: () => void;
}

export function ChatCard({
  chatId,
  lastMessage,
  lastMessageTime,
  isActive,
  onClick,
}: ChatCardProps) {
  
  return (
    <div
      className={`${styles.chatCard} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
    {/* Механизм аналогичен логике WA: когда у пользователя нет аватарки, отображается первая буква имени. Но в условиях задания, без подгрузки и сохранения имени, оставляем первый символ номера телефона */}
      <div className={styles.avatar}>{formatPhoneNumber(chatId).charAt(0)}</div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{formatPhoneNumber(chatId)}</h4>
          <span className={styles.time}>{formatTimeList(lastMessageTime)}</span>
        </div>
        <p className={styles.preview}>{lastMessage || 'Нет сообщений'}</p>
      </div>
    </div>
  );
}
