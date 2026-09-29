export interface UserData {
  idInstance: number;
  apiTokenInstance: string;
  apiUrl: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface StateInstanceResponse {
  stateInstance: string; // 'authorized' в случае успешной авторизации
}

export interface DeleteNotificationResponse {
  result: boolean;
  reason?: string;
}

export interface Notification {
  receiptId: number;
  body: ResponseBody;
}

export interface ResponseBody {
  typeWebhook: string;
  idMessage?: string;
  instanceData: {
    idInstance: string;
    wid: string;
    typeInstance: string; // 'whatsapp'
  };
  timestamp: number;
  senderData: {
    chatId: string;
    sender: string;
    senderName: string;
    senderContactName?: string;
    chatName: string;
  };
  messageData?: {
    typeMessage: string; // в случае с текстовыми сообщениями'textMessage'
    textMessageData?: { textMessage: string };
  };
}

// Разные фазы, в которых может находиться форма логина.
// 'idle' - ничего не происходит, форма пустая или заполняется
// 'checking' - отправили запрос getStateInstance, ждём ответ
// 'error' - запрос вернул ошибку (неверные данные, сеть и т.д.)
export type LoginStatus = 'idle' | 'checking' | 'error';