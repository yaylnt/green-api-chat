import { useState } from 'react';
import { Button } from '../Button/Button';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function MessageInput({ onSendMessage, disabled, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || disabled || isLoading) return;

    onSendMessage(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.messageField}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Введите сообщение..."
        className={styles.input}
        disabled={disabled || isLoading}
      />
      <Button
        variant="primary"
        type="button"
        disabled={!message.trim() || disabled || isLoading}
        onClick={handleSend}
        className={styles.button}
        title="Нажмите Enter для отправки"
      >
        Отправить
      </Button>
    </div>
  );
}
