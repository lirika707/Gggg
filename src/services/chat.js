import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Отправить сообщение в чат
 */
export async function sendMessage(text, senderId) {
  if (!text.trim()) return;
  try {
    await addDoc(collection(db, 'messages'), {
      text,
      senderId,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Error sending message:", e);
  }
}

/**
 * Слушать новые сообщения (реальное время)
 */
export function subscribeToMessages(callback) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
}

/**
 * Рендеринг интерфейса чата (Tailwind)
 */
export function renderChat(containerId, currentUserId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
      <!-- Заголовок -->
      <div class="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
        <h3 class="text-lg font-black uppercase tracking-tight">Общий чат фермеров</h3>
        <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">В сети: онлайн</p>
      </div>

      <!-- Список сообщений -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/30 dark:bg-transparent">
        <div class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      </div>

      <!-- Поле ввода -->
      <div class="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
        <div class="flex gap-3">
          <input 
            type="text" 
            id="chat-input" 
            placeholder="Напишите сообщение..." 
            class="flex-1 bg-slate-100 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
          >
          <button 
            id="chat-send" 
            class="bg-emerald-600 text-white p-4 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const messagesDiv = container.querySelector('#chat-messages');
  const input = container.querySelector('#chat-input');
  const sendBtn = container.querySelector('#chat-send');

  // Функция для отрисовки списка сообщений
  const updateMessagesUI = (messages) => {
    messagesDiv.innerHTML = messages.map(msg => {
      const isMine = msg.senderId === currentUserId;
      return `
        <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[80%] ${isMine ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-bl-none'} p-4 rounded-[1.5rem] shadow-sm">
            <p class="text-sm font-bold leading-relaxed">${msg.text}</p>
            <p class="text-[9px] ${isMine ? 'text-emerald-100' : 'text-slate-400'} mt-1 uppercase font-black tracking-widest text-right">
              ${msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
            </p>
          </div>
        </div>
      `;
    }).join('');
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };

  // Подписка
  const unsubscribe = subscribeToMessages(updateMessagesUI);

  // Обработка отправки
  const handleSend = async () => {
    const text = input.value;
    if (text.trim()) {
      input.value = '';
      await sendMessage(text, currentUserId);
    }
  };

  sendBtn.onclick = handleSend;
  input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

  return unsubscribe; // Позволяет отписаться при удалении компонента
}
