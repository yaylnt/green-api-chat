import { useState } from 'react';
import { Button } from '../Button/Button';
import styles from './NewChatModal.module.css';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (phoneNumber: string) => void;
  isLoading?: boolean;
}

export function NewChatModal({ isOpen, onClose, onCreate, isLoading = false }: NewChatModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setPhoneNumber('');
    setError('');
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      setError('Номер телефона должен содержать 11 цифр');
      return false;
    }
    if (!cleaned.startsWith('7')) {
      setError('Номер телефона должен начинаться с 7');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Введите номер телефона');
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) return;
    onCreate(phoneNumber.replace(/\D/g, ''));
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      <div className={`${styles.modal} ${isClosing ? styles.modalClosing : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Новый чат</h2>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть" disabled={isLoading}/>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="phone-number">Введите номер телефона</label>
            <input
              id="phone-number"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              type="tel"
              placeholder="71234567890"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
              disabled={isLoading}
            />
            {error && <span className={styles.error}>{error}</span>}
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleClose} disabled={isLoading} type="button">Отмена</Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              Создать чат
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
