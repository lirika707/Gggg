import { GoogleGenAI } from '@google/genai';
import {
    ArrowLeft,
    ChevronDown,
    Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from "../utils";

export const ListingsSection = ({ onListingClick, showTitle = true }: { onListingClick: (id: string) => void, showTitle?: boolean }) => {
  const crops = [
    { id: '1', name: 'Пшеница', status: 'good', health: 98, moisture: 42, statusText: 'Стабильно', image: 'https://picsum.photos/seed/wheat/400/400' },
    { id: '2', name: 'Кукуруза', status: 'warning', health: 75, moisture: 32, statusText: 'Полив завтра', image: 'https://picsum.photos/seed/corn/400/400' },
    { id: '3', name: 'Томаты', status: 'critical', health: 45, moisture: 15, statusText: 'Нужна проверка', image: 'https://picsum.photos/seed/tomato/400/400' },
  ];

  return (
    <section className={cn(showTitle ? "mt-12 px-6" : "")}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Мои <span className="text-emerald-600 dark:text-emerald-400">Культуры</span>
          </h3>
          <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Управление</button>
        </div>
      )}
      <div className={cn("flex gap-4 overflow-x-auto no-scrollbar", showTitle ? "pb-8" : "")}>
          {crops.map(crop => (
            <motion.div 
              key={crop.id}
              whileHover={{ y: -5 }}
              className={cn(
                "min-w-[260px] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm",
                crop.status === 'good' ? "border-emerald-100" : crop.status === 'warning' ? "border-amber-100" : "border-red-100"
              )}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{crop.name}</h4>
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                    crop.status === 'good' ? "bg-emerald-50 text-emerald-700" : crop.status === 'warning' ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                  )}>
                    {crop.status === 'good' ? 'Отлично' : crop.status === 'warning' ? 'Внимание' : 'Критично'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Здоровье</span>
                    <span className="text-slate-900 dark:text-white font-bold">{crop.health}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-500",
                      crop.status === 'good' ? "bg-emerald-500" : crop.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                    )} style={{ width: `${crop.health}%` }} />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{crop.statusText}</p>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export const ReviewsSection = () => {
  const reviews = [
    { id: 1, name: 'Ольга', location: 'г. Люберцы', rating: 5, text: 'Прекрасный сервис и качественные продукты. Молочка и мясо на высоте. Цены на многие продукты ниже чем в магазинах.' },
    { id: 2, name: 'Иван', location: 'г. Бишкек', rating: 5, text: 'Очень удобно заказывать свежие овощи прямо с грядки. Доставка быстрая, все приехало в лучшем виде.' },
  ];

  return (
    <div className="mt-12 px-6">
      <div className="text-center mb-6 relative">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-48 h-12 bg-brand-50/50 dark:bg-brand-950/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Отзывы <span className="text-brand-600 dark:text-brand-400">покупателей</span>
        </h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
        {reviews.map((review) => (
          <div key={review.id} className="min-w-[280px] bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{review.name}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{review.location}</p>
              </div>
              <div className="flex gap-0.5">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-100 dark:shadow-brand-900/20 active:scale-95 transition-transform">
        Все отзывы
      </button>
    </div>
  );
};

export const FAQSection = () => {
  const faqs = [
    { q: 'Что такое EGIN?', a: 'EGIN — это маркетплейс для фермеров и покупателей.' },
    { q: 'Условия доставки', a: 'Доставка осуществляется курьером или самовывозом.' },
    { q: 'Как мы работаем?', a: 'Мы соединяем фермеров напрямую с покупателями.' },
    { q: 'Сборка заказа', a: 'Ваш заказ собирается фермером в день доставки.' },
    { q: 'Способы оплаты', a: 'Оплата картой или наличными при получении.' },
    { q: 'Процесс оплаты', a: 'Безопасная оплата через наше приложение.' },
  ];

  return (
    <div className="mt-12 px-6 pb-12">
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-48 h-12 bg-brand-50/50 dark:bg-brand-950/20 rounded-full blur-xl"></div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
          Вопросы и <span className="text-brand-600 dark:text-brand-400">ответы</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight pr-2">{faq.q}</span>
            <ChevronDown size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-600 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeatherDetailsPage = ({ onBack, crops }: { onBack: () => void; crops: string[] }) => {
  const [forecast, setForecast] = useState<any[]>([]);
  const [advice, setAdvice] = useState<string>('');

  useEffect(() => {
    // Mock weather forecast - in real app, call a public forecast API
    setForecast(Array.from({ length: 10 }, (_, i) => ({
      day: new Date(Date.now() + i * 86400000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      temp: 15 + i + Math.floor(Math.random() * 5),
      desc: i % 2 === 0 ? 'Солнечно' : 'Облачно'
    })));
  }, []);

  const getAdvice = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const forecastSummary = forecast.map(f => `${f.day}: ${f.temp}°C, ${f.desc}`).join('; ');
      
      const prompt = `Based on the following 10-day weather forecast: ${forecastSummary}, for these crops: ${crops.join(', ')}, provide actionable gardening advice. What should the user do right now? Keep it practical and brief, in Russian.`;
      
      const result = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: [prompt] });
      setAdvice(result.text || 'Нет специальных советов.');
    } catch (e) {
      setAdvice('Не удалось получить совет от AI.');
    }
  };

  useEffect(() => {
    if (crops.length > 0 && forecast.length > 0) getAdvice();
  }, [crops, forecast]);

  return (
    <div className="pb-24 px-6 pt-6">
      <button onClick={onBack} className="mb-4 flex items-center text-slate-500"><ArrowLeft size={16} /> Назад</button>
      <h2 className="text-2xl font-black mb-6">Прогноз на 10 дней</h2>
      <div className="space-y-2">
        {forecast.map((d, i) => (
          <div key={i} className="flex justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700 dark:text-slate-300">{d.day}</span>
            <span className="text-brand-600 font-bold">{d.temp}°C</span>
            <span className="text-slate-500">{d.desc}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-amber-50 dark:bg-amber-950 p-4 rounded-xl border border-amber-100">
        <h3 className="font-bold mb-2 text-amber-800 dark:text-amber-200">Примечание:</h3>
        <p className="text-xs text-amber-700 dark:text-amber-300">
            Данные об истории погоды за прошлые годы недоступны через текущие общедоступные API-интерфейсы погоды.
        </p>
      </div>

      <div className="mt-6 bg-emerald-50 dark:bg-emerald-950 p-4 rounded-xl">
        <h3 className="font-bold mb-2">Советы по уходу:</h3>
        <p className="text-sm">{advice}</p>
      </div>
    </div>
  );
};

