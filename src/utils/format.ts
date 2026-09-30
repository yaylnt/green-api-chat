// Форматируем из 71234567890 в +7 123 456-78-90
export const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('7') && phone.length === 11) {
        return `+${phone.slice(0, 1)} ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
    }
    return phone;
};

export const formatTimeChat = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

export const formatTimeList = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
};