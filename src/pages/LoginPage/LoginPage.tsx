import { useState } from 'react';
import { getApiUrl } from '../../utils/getApiUrl';
import { getStateInstance, ApiError } from '../../api/greenApi';
import { Button } from '../../components/Button';
import type { UserData, LoginStatus } from '../../api/types';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  onLogin: (data: UserData) => void;
}

const isDigitsOnly = (value: string): boolean => /^\d+$/.test(value);

export function LoginPage({ onLogin }: LoginPageProps) {
  const [idInstanceInput, setIdInstanceInput] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');

  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (idInstanceInput === '' || !apiTokenInstance.trim()) {
      setStatus('error');
      setErrorMessage('Заполните оба поля');
      return;
    }
    if (!isDigitsOnly(idInstanceInput)) {
      setStatus('error');
      setErrorMessage('ID инстанса может быть только числом');
      return;
    }

    setStatus('checking');
    setErrorMessage('');

    const idInstance = Number(idInstanceInput);
    const userData: UserData = {
      idInstance,
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: getApiUrl(idInstance),
    };

    try {
      const result = await getStateInstance(userData);

      if (result?.stateInstance !== 'authorized') {
        setStatus('error');
        setErrorMessage(
          `Инстанс не авторизован (статус: ${result?.stateInstance ?? 'неизвестен'}). Отсканируйте QR-код в личном кабинете GREEN-API.`
        );
        return;
      }
      onLogin(userData);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Не удалось подключиться. Проверьте ID инстанса и токен, а также подключение к интернету.'
      );
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.title}>GREEN-API CHAT</div>
      <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.formTitle}>Вход в чат</h1>
      <label className={styles.label}>
        ID инстанса
        <input
          type="text"
          inputMode="numeric"
          value={idInstanceInput}
          onChange={
            (e) => setIdInstanceInput(e.target.value)}
          placeholder="1101234567"
          disabled={status === 'checking'}
          className={styles.input}
        />
      </label>
      <label className={styles.label}>
        API токен
        <input
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          placeholder="e8dc45b2..."
          disabled={status === 'checking'}
          className={styles.input}
        />
      </label>

      {status === 'error' && <p role="alert" className={styles.errorMessage}>
        {errorMessage}
      </p>}

      <Button type="submit" disabled={status === 'checking'}>
        {status === 'checking' ? 'Проверяем…' : 'Войти'}
      </Button>
      </form>
    </main>
  );
}
