import { analyzePlantImage, chatWithAI, fileToBase64, type PlantDiagnosisResult } from '../services/aiAPI';
import { GoogleGenAI } from '@google/genai';
import {
    AlertTriangle,
    Camera,
    ChevronRight,
    Droplets,
    FileText,
    Image as ImageIcon,
    Lightbulb,
    PlusCircle,
    Scan,
    Search,
    ShoppingBag,
    Sparkles,
    Sun,
    User,
    X
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { MOCK_COMMUNITIES, MOCK_NEWS, MOCK_PRODUCTS } from "../constants/mocks";
import {
    addDoc,
    collection,
    db,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from '../firebase';
import { useAuth } from "../hooks";
import { Message, View } from "../types";

export const AIAssistantPage = ({ setView, weather }: { setView: (v: View) => void, weather: { temp: string, desc: string } | null }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) {
      setMessages([{
        id: 'welcome',
        text: 'Здравствуйте! Я ваш ИИ-помощник агроном. Могу подсказать цены на рынке, определить болезнь растения по фото или помочь советом по хозяйству. Что вас интересует?',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }
    const q = query(
      collection(db, 'users', currentUser.uid, 'ai_messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp,
          image: data.image
        });
      });
      
      if (fetchedMessages.length === 0) {
        // Welcome message if chat history is empty
        setMessages([{
          id: 'welcome',
          text: 'Здравствуйте! Я ваш ИИ-помощник агроном. Могу подсказать цены на рынке, определить болезнь растения по фото или помочь советом по хозяйству. Что вас интересует?',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(fetchedMessages);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() && !selectedImage) return;
    if (!currentUser) {
      alert("Пожалуйста, войдите или зарегистрируйтесь, чтобы использовать ИИ-помощника.");
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentImage = selectedImage;
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, 'users', currentUser.uid, 'ai_messages'), {
        userId: currentUser.uid,
        text,
        sender: 'user',
        timestamp,
        image: currentImage || null,
        createdAt: serverTimestamp()
      });

      // Build dynamic chat history for Gemini
      const history = messages.filter(m => m.id !== 'welcome').map(msg => {
        const msgParts: any[] = [];
        if (msg.text.trim()) {
          msgParts.push({ text: msg.text });
        }
        return { role: msg.sender === 'user' ? 'user' : 'model', parts: msgParts };
      });
      
      let finalPrompt = text;
      if (weather) {
        finalPrompt = `[Текущая погода: ${weather.temp}°C, ${weather.desc}]. ${finalPrompt}`;
      }
      
      history.push({ role: 'user', parts: [{ text: finalPrompt }] });

      const systemInstruction = `Вы — опытный и дружелюбный ИИ-помощник фермер и агроном. Ваша задача — помогать фермерам. Вы отлично разбираетесь в болезнях растений, урожае, удобрениях, ценах на местном рынке и поиске покупателей. 
          
          Если вас просят проанализировать фото культуры:
          - Проведите детальный осмотр: определите признаки заболеваний (грибок, вредители, нехватка нутриентов).
          - Оцените степень поражения.
          - Учитывайте предоставленные погодные условия для оценки рисков (например, высокая влажность способствует грибку).
          - Дайте четкий алгоритм действий: что делать прямо сейчас, какие меры профилактики принять.
          
          Если вас просят дать рекомендации:
          - Проанализируйте историю диалога, чтобы понять контекст.
          - Учитывайте предоставленные текущие погодные условия.
          - Предложите конкретные, структурированные агротехнические советы на ближайшие дни.
          
          Общайтесь профессионально, просто и понятно, как опытный коллега-агроном. Форматируйте ответ красиво (используйте Markdown, заголовки, списки). Будьте конкретны и лаконичны.`;

      // Call our Cloud Function instead of direct SDK in browser
      const aiText = await chatWithAI(history, systemInstruction, currentImage);

      // Save AI response to Firestore
      await addDoc(collection(db, 'users', currentUser.uid, 'ai_messages'), {
        userId: currentUser.uid,
        text: aiText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: serverTimestamp()
      });

    } catch (error: any) {
       console.error("AI Error:", error);
       if (currentUser) {
         await addDoc(collection(db, 'users', currentUser.uid, 'ai_messages'), {
           userId: currentUser.uid,
           text: `Произошла ошибка при обращении к ИИ: ${error?.message || 'Неизвестная ошибка'}. Пожалуйста, попробуйте позже.`,
           sender: 'ai',
           timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
           createdAt: serverTimestamp()
         });
       }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-slate-50 dark:bg-slate-950">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
            
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-brand-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-none'
            }`}>
              {msg.image && (
                <div className="mb-3 rounded-2xl overflow-hidden border border-white/20">
                  <img src={msg.image} alt="User Upload" className="max-w-full max-h-48 object-cover" />
                </div>
              )}
              <div className="markdown-body whitespace-pre-wrap">
                <Markdown>{msg.text}</Markdown>
              </div>
              
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Рекомендации:</p>
                  <div className="flex flex-col gap-2">
                    {msg.suggestions.map((s, i) => (
                      <button 
                        key={i}
                        className="text-left p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium text-brand-700 dark:text-brand-400 flex items-center justify-between group hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-200 dark:hover:border-brand-800 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          {s.type === 'link' && <ShoppingBag size={12} />}
                          {s.type === 'tip' && <Sparkles size={12} />}
                          {s.type === 'action' && <ChevronRight size={12} />}
                          {s.label}
                        </span>
                        <ChevronRight size={12} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className={`text-[10px] mt-2 opacity-70 ${msg.sender === 'user' ? 'text-brand-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp}
              </p>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center shrink-0 overflow-hidden">
                <User size={16} className="text-brand-700" />
              </div>
            )}
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl rounded-bl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-950">
        {[
          { label: 'Определить болезнь', icon: Sparkles },
          { label: 'Узнать цены на картофель', icon: ShoppingBag },
          { label: 'Как ухаживать за помидорами', icon: User },
          { label: 'Предложить рекомендации', icon: Lightbulb },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => handleSendMessage(action.label)}
            className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center gap-2 shadow-sm"
          >
            <action.icon size={14} />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <PlusCircle size={20} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={selectedImage ? "Добавьте описание к фото..." : "Спросите что-нибудь..."}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() && !selectedImage}
            className={`p-3 rounded-2xl transition-all ${
              (inputValue.trim() || selectedImage)
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AISearchPage = ({ setView, onResultClick }: { setView: (v: View) => void, onResultClick: (item: any) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // Simulate AI search - simplified for demo: categorizing query and matching data items
    try {
      const lowerQuery = query.toLowerCase();
      
      const products = MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery)
      ).map(p => ({ type: 'product', ...p }));
      
      const news = MOCK_NEWS.filter(n => 
        n.title.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery)
      ).map(n => ({ type: 'news', name: n.title, description: n.content.substring(0, 100) + '...', ...n }));

      const communities = MOCK_COMMUNITIES.filter(c => 
        c.name.toLowerCase().includes(lowerQuery)
      ).map(c => ({ type: 'community', name: c.name, description: `${c.chats.length} ${c.chats.length === 1 ? 'чат' : 'чатов'}`, ...c }));

      let usersList: any[] = [];
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        usersList = usersSnap.docs.map(doc => {
          const data = doc.data();
          return {
            type: 'user',
            id: doc.id,
            name: data.displayName || 'Пользователь',
            description: data.bio || data.email || '',
            ...data
          };
        }).filter(u => u.name.toLowerCase().includes(lowerQuery) || u.description.toLowerCase().includes(lowerQuery));
      } catch (err) {
        console.warn("Could not fetch users for search", err);
      }
      
      setResults([...products, ...news, ...communities, ...usersList]);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'product': return 'Товар';
      case 'news': return 'Статья';
      case 'community': return 'Сообщество';
      case 'user': return 'Пользователь';
      default: return type;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pt-20">
      <div className="flex items-center gap-2 mb-6">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по товарам, людям, новостям, сообществам..."
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand-500/20"
        />
        <button 
          onClick={handleSearch}
          className="bg-brand-600 text-white p-3 rounded-2xl"
        >
          <Search size={20} />
        </button>
      </div>
      
      {loading ? (
        <p className="text-center text-slate-500">Поиск...</p>
      ) : (
        <div className="grid gap-4">
          {results.map((res, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-brand-500 transition-colors"
              onClick={() => onResultClick(res)}
            >
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{getTypeName(res.type)}</span>
              <h4 className="font-bold text-slate-900 dark:text-white mt-1">{res.name || 'Элемент'}</h4>
              {res.description && <p className="text-sm text-slate-500 line-clamp-2 mt-1">{res.description}</p>}
            </div>
          ))}
          {results.length === 0 && query && <p className="text-center text-slate-500">Ничего не найдено</p>}
        </div>
      )}
    </div>
  );
};

export const AIPhotoReport = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'report' | 'error'>('upload');
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('scanning');
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzePlantImage(base64);
      setDiagnosis(result);
      setStep('report');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Произошла ошибка при анализе.');
      setStep('error');
    }
  };

  const handleStartScan = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-md md:max-w-xl lg:max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
        />
        
        {step === 'upload' && (
          <div className="p-10">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Scan size={48} className="animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-4 tracking-tight">AI Crop Scan</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-10 leading-relaxed font-medium">
              Загрузите фото вашего урожая для мгновенного анализа болезней и получения рекомендаций по лечению.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={handleStartScan}
                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                <Camera size={22} /> Сделать фото / Выбрать
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="relative w-40 h-40 mb-10">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-4 border-emerald-500/40 border-t-emerald-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={48} className="text-emerald-500 animate-bounce" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter">Анализируем...</h3>
            <p className="text-slate-500 dark:text-white/60 text-sm font-medium animate-pulse uppercase tracking-widest">ИИ Изучает ваше растение</p>
          </div>
        )}

        {step === 'error' && (
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ошибка</h3>
            <p className="text-slate-500 mb-8">{errorMsg}</p>
            <button 
              onClick={() => setStep('upload')}
              className="w-full py-4 bg-emerald-600 text-white rounded-3xl font-black"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {step === 'report' && diagnosis && (
          <div className="p-0 flex flex-col max-h-[85vh]">
            <div className="bg-emerald-600 p-8 text-white relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <FileText size={24} />
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <h3 className="text-3xl font-black tracking-tighter mb-1">Отчет AI</h3>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
              <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest block mb-2">Результат анализа</h4>
                <p className="text-xl font-black text-slate-900 dark:text-white">{diagnosis.disease}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Описание</h4>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400 leading-relaxed">
                    {diagnosis.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/60">Рекомендации (Центральная Азия)</h4>
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5">
                   <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                     {diagnosis.treatment}
                   </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all sticky bottom-0"
              >
                Готово
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

