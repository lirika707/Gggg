import {
    ArrowLeft,
    Bell,
    Droplets,
    Filter,
    Heart,
    Home,
    MessageSquare,
    Minus,
    Plus,
    PlusCircle,
    Search,
    Shield,
    ShoppingBag,
    Sparkles,
    Star,
    Sun,
    User,
    Users
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { chatWithAI } from '../services/aiAPI';
import { NotificationBell } from '../components/NotificationBell';
import { useI18n } from "../i18n";
import { Listing, Product, View } from "../types";
import { cn } from "../utils";

export const UnifiedAICard = ({ onScanClick, crops, weather }: { 
  onScanClick: () => void, 
  crops: string[], 
  weather: { temp: string, desc: string, city: string } | null 
}) => {
  const [advice, setAdvice] = useState<string>('Загрузка совета...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      if (!crops.length && !weather) return;
      setLoading(true);
      try {
        const cropsStr = crops.join(', ');
        const weatherStr = weather ? `${weather.city}: ${weather.temp}°C, ${weather.desc}` : 'данные погоды недоступны';
        
        const prompt = `Дай ОДИН очень короткий (макс 10-15 слов) практический совет фермеру на сегодня. 
        Культуры: ${cropsStr || 'не указаны'}. 
        Погода: ${weatherStr}. 
        Совет должен быть на русском языке, полезным и вдохновляющим. Ответь ТОЛЬКО текстом совета.`;

        const result = await chatWithAI(
          [{ role: 'user', content: prompt }], 
          "Ты - экспертный агроном-консультант системы EGIN. Давай краткие и точные советы."
        );
        setAdvice(result);
      } catch (err) {
        setAdvice('Проверьте ваши культуры и погоду для получения совета.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [crops, weather]);

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm min-h-[180px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Совет ИИ</h2>
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-4">
        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
          </div>
        ) : (
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {advice}
          </h3>
        )}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onScanClick}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all mt-auto"
      >
        Подробнее в чате
      </motion.button>
    </div>
  );
};

export const ListingCard: React.FC<{ listing: Listing | Product; onClick?: () => void }> = ({ listing, onClick }) => {
  const product = listing as Product;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="min-w-[200px] w-[200px] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col cursor-pointer"
    >
      <div className="relative h-32">
        <img 
          src={listing.image} 
          alt={listing.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-full text-slate-300 dark:text-slate-600 shadow-sm">
          <Star size={14} className={listing.rating > 4 ? "text-yellow-500 fill-yellow-500" : ""} />
        </div>
        {product.badge && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-brand-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">
            {product.badge === 'new' ? 'Новое' : product.badge === 'popular' ? 'Хит' : 'Топ'}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{listing.price} {listing.quantity ? `за ${listing.quantity}` : 'за 1 кг'}</span>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mt-0.5 truncate">{listing.name}</h4>
        </div>
        
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{listing.rating}</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:underline">
            Подробнее
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const ActionButtons = ({ onMarketClick, onAIClick }: { onMarketClick: () => void; onAIClick: () => void }) => (
  <div className="px-6 flex items-center gap-4">
    <button 
      onClick={onMarketClick}
      className="flex-1 glass rounded-3xl py-4 flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300 hover:bg-white/20 transition-all active:scale-95"
    >
      <ShoppingBag size={18} />
      <span className="text-xs font-black uppercase tracking-widest">Маркет</span>
    </button>
    <button 
      onClick={onAIClick}
      className="w-14 h-14 glass rounded-3xl flex items-center justify-center text-brand-600 hover:bg-white/20 transition-all active:scale-95"
    >
      <Sparkles size={20} />
    </button>
    <button className="w-14 h-14 glass rounded-3xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white/20 transition-all active:scale-95">
      <Bell size={20} />
    </button>
  </div>
);

export const SearchBar = () => (
  <div className="px-6 mt-4">
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input 
        type="text" 
        placeholder="Поиск продуктов..." 
        className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm dark:text-white dark:placeholder:text-slate-600"
      />
      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-xl">
        <Filter size={18} />
      </button>
    </div>
  </div>
);

export const SubcategoryChips = ({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) => (
  <div className="mt-3">
    <div className="flex overflow-x-auto px-6 gap-2 no-scrollbar pb-2">
      {['Все', 'Новинки', 'Популярные', 'Семена'].map((sub) => (
        <button
          key={sub}
          onClick={() => onSelect(sub)}
          className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selected === sub 
              ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {sub}
        </button>
      ))}
    </div>
  </div>
);

export const ProductCard: React.FC<{ 
  product: Product; 
  onClick?: () => void; 
  onAddClick?: (e: React.MouseEvent) => void;
  viewMode?: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}> = ({ product, onClick, onAddClick, viewMode = 'grid', isFavorite, onToggleFavorite }) => {
  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group flex gap-4 cursor-pointer"
      >
        <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          {product.badge && (
            <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-600 text-white text-[8px] font-black uppercase rounded-md shadow-sm">
              {product.badge === 'new' ? 'Новое' : product.badge === 'popular' ? 'Хит' : 'Топ'}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{product.name}</h4>
              <span className="text-sm font-black text-brand-600 dark:text-brand-400 whitespace-nowrap">{product.price}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{product.quantity || '1 кг'} • {product.location}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star size={10} className="text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{product.rating}</span>
            </div>
            <button
              className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(e);
              }}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-3">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {product.badge && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-[9px] font-black uppercase rounded-lg shadow-sm">
            {product.badge === 'new' ? 'Новое' : product.badge === 'popular' ? 'Хит' : 'Топ'}
          </div>
        )}
        <button 
          className={`absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm ${isFavorite ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(e);
          }}
        >
          <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-1 flex-1 flex flex-col">
        <span className="text-sm font-black text-slate-900 dark:text-white block mb-0.5">{product.price}</span>
        <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-0.5 line-clamp-1">{product.name}</h4>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">{product.quantity || '1 кг'}</p>
        
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-tight">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{product.rating}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Смотреть</span>
        </div>
      </div>
    </motion.div>
  );
};

export const MarketHeader = ({ onSearch }: { onSearch?: (query: string) => void }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(query || '');
  };

  return (
    <div className="bg-white dark:bg-slate-950 pt-4 pb-6 px-6 transition-colors duration-500">
      {/* Search Bar */}
      <div className="relative z-10">
        <form onSubmit={handleSearch} className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск продуктов..." 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-brand-500/20 transition-all dark:text-white"
            />
          </div>
          <button type="button" className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20 active:scale-90 transition-transform">
            <Filter size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export const Header = ({ 
  title, 
  location, 
  showBack, 
  onBack, 
  onMessageClick, 
  onAddClick, 
  onSearchClick,
  onWeatherClick,
  isHome,
  weather
}: { 
  title: string, 
  location?: string, 
  showBack?: boolean, 
  onBack?: () => void,
  onMessageClick?: () => void,
  onAddClick?: () => void,
  onSearchClick?: () => void,
  onWeatherClick?: () => void,
  isHome?: boolean,
  weather?: { temp: string, desc: string, city: string } | null
}) => (
  <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800">
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          {showBack && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-900 dark:text-white" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
            {location && <p className="text-xs text-slate-500 dark:text-slate-400">{location}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSearchClick && (
            <button onClick={onSearchClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Search size={20} className="text-slate-900 dark:text-white" />
            </button>
          )}
          {onMessageClick && (
            <button onClick={onMessageClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MessageSquare size={20} className="text-slate-900 dark:text-white" />
            </button>
          )}
          {onAddClick && (
            <button onClick={onAddClick} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <PlusCircle size={20} className="text-slate-900 dark:text-white" />
            </button>
          )}
          <NotificationBell />
        </div>
      </div>
      {isHome && (
        <button 
          onClick={onWeatherClick}
          className="w-full flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 -mx-6 px-6 pb-2 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{weather?.city || 'Бишкек'}</p>
            <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-1">
              <Sun size={16} className="text-emerald-500" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{weather ? `${weather.temp}°C` : '28°C'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={14} className="text-blue-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{weather ? weather.desc : '42%'}</span>
          </div>
        </button>
      )}
    </div>
  </div>
);

export const SpecialOfferCarousel = () => (
  <div className="mt-[-60px] relative z-20">
    <div className="flex items-center justify-between px-6 mb-4">
      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">#СпециальноДляВас</h3>
      <button className="text-brand-600 dark:text-brand-400 text-xs font-bold hover:underline">Смотреть все</button>
    </div>
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
      {[
        { id: 1, title: 'Спецпредложение', discount: 'До 40%', image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=400', color: 'from-brand-600 to-brand-800' },
        { id: 2, title: 'Новый урожай', discount: 'До 25%', image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=400', color: 'from-emerald-600 to-emerald-800' },
      ].map((offer) => (
        <div key={offer.id} className={`relative shrink-0 w-[85%] sm:w-[400px] h-44 rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${offer.color} p-6 flex items-center shadow-xl shadow-brand-500/20 dark:shadow-none`}>
          <div className="relative z-10 max-w-[60%]">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest mb-2 inline-block border border-white/10">Ограничено</span>
            <h4 className="text-white text-lg font-bold leading-tight mb-1">{offer.title}</h4>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-white/80 text-xs font-medium">Скидки</span>
              <span className="text-white text-3xl font-black">{(offer.discount || '').split(' ')[1] || (offer.discount || '')}</span>
            </div>
            <button className="px-6 py-2 bg-white text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
              Получить
            </button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2">
            <img 
              src={offer.image} 
              alt={offer.title} 
              className="w-full h-full object-cover mix-blend-overlay opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        </div>
      ))}
    </div>
    {/* Carousel Dots */}
    <div className="flex justify-center gap-1.5 mt-2">
      <div className="w-5 h-1.5 bg-brand-600 rounded-full" />
      <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
      <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
  </div>
);

export const BottomNav = ({ activeTab, onTabChange, isAdmin }: { activeTab: View; onTabChange: (t: View) => void; isAdmin?: boolean }) => {
  const { t } = useI18n();
  const tabs = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'market', label: t('market'), icon: ShoppingBag },
    { id: 'ai', label: t('ai'), icon: Sparkles },
    { id: 'communities', label: t('communities'), icon: Users },
    { id: 'settings', label: t('profile'), icon: User },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: t('admin_panel'), icon: Shield });
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg h-14 glass flex justify-between items-center px-6 z-50 rounded-full shadow-lg border border-white/10 dark:border-white/5">
      {tabs.map((item) => (
        <button 
          key={item.id}
          onClick={() => onTabChange(item.id as View)}
          className="relative flex flex-col items-center group"
        >
          {activeTab === item.id && (
            <motion.div 
              layoutId="nav-glow"
              className="absolute -inset-2 bg-emerald-500/10 blur-lg rounded-full"
            />
          )}
          <item.icon 
            size={22} 
            className={cn(
              "transition-all duration-300",
              activeTab === item.id ? "text-emerald-500 scale-110" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )} 
          />
          <span className={cn(
            "text-[8px] font-black uppercase tracking-widest mt-1.5 transition-all duration-300",
            activeTab === item.id ? "text-emerald-500 opacity-100" : "text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100"
          )}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export const ChatFAB = () => null;

