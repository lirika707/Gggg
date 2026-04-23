import {
    ArrowRight,
    ChevronRight,
    PlusCircle,
    Users
} from 'lucide-react';
import { useState } from 'react';
import { MOCK_COMMUNITIES } from "../constants/mocks";
import { CommunityCategory, CommunityChat } from "../types";

export const CommunitiesPage = ({ onCategoryClick }: { onCategoryClick: (cat: CommunityCategory) => void }) => {
  return (
    <div className="pb-24 px-6 pt-6">
      <div className="bg-brand-900 rounded-[40px] p-8 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Сообщества</h2>
          <p className="text-brand-200 text-sm opacity-80">Общайтесь, делитесь опытом и находите единомышленников в агро-сфере.</p>
        </div>
        <Users className="absolute -bottom-6 -right-6 text-brand-800 opacity-20" size={160} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_COMMUNITIES.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => onCategoryClick(cat)}
            className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
          >
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
              <cat.icon size={28} />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-bold text-slate-900 dark:text-white">{cat.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{cat.chats.length} активных чатов</p>
            </div>
            <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ChatListPage = ({ category, onChatClick }: { category: CommunityCategory; onChatClick: (chat: CommunityChat) => void }) => {
  return (
    <div className="pb-24 px-6 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
          <category.icon size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category.name}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {category.chats.map((chat) => (
          <button 
            key={chat.id}
            onClick={() => onChatClick(chat)}
            className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-100 dark:hover:border-brand-900 transition-all"
          >
            <img src={chat.image} alt={chat.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" referrerPolicy="no-referrer" />
            <div className="flex-1 text-left min-w-0">
              <h4 className="font-bold text-slate-900 dark:text-white truncate">{chat.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{chat.lastMessage}</p>
              <div className="flex items-center gap-2 mt-2">
                <Users size={12} className="text-slate-300 dark:text-slate-600" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{chat.members} участников</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

export const ChatRoomPage = ({ chat }: { chat: CommunityChat }) => {
  const [messages, setMessages] = useState([
    { id: '1', user: 'Алексей', text: 'Всем привет! Кто уже начал посевную?', time: '10:00', isMe: false },
    { id: '2', user: 'Мария', text: 'Мы в Чуйской области уже начали картофель сажать.', time: '10:05', isMe: false },
    { id: '3', user: 'Вы', text: 'А какой сорт используете?', time: '10:10', isMe: true },
    { id: '4', user: 'Мария', text: 'В основном Алладин и Розара.', time: '10:12', isMe: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: Date.now().toString(),
      user: 'Вы',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    }]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
            {!msg.isMe && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 ml-2">{msg.user}</span>}
            <div className={`max-w-[80%] p-4 rounded-3xl text-sm ${
              msg.isMe 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-800'
            }`}>
              {msg.text}
              <div className={`text-[10px] mt-1 ${msg.isMe ? 'text-brand-200' : 'text-slate-300 dark:text-slate-600'} text-right`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button className="p-3 text-slate-400 dark:text-slate-500 hover:text-brand-600 transition-colors">
            <PlusCircle size={24} />
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-3 bg-brand-600 text-white rounded-2xl disabled:opacity-50 transition-all"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

