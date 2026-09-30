import type { MessageNotification } from '../../api/types';
import { formatTimeChat } from '../../utils/format';
import styles from './Message.module.css';

interface MessageProps {
  message: MessageNotification;
  isSent: boolean;
}

export function Message({ message, isSent }: MessageProps) {
  return (
    <div className={`${styles.messageWrapper} ${isSent ? styles.sent : styles.received}`}>
      <div className={styles.messageBubble}>
        <p className={styles.text}>{message.text}</p>
        <span className={styles.time}>{formatTimeChat(message.timestamp)}</span>
      </div>
    </div>
  );
}
