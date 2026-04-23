import {
    ArrowLeft,
    Camera,
    ChevronRight,
    Filter,
    Heart,
    Image as ImageIcon,
    LayoutGrid,
    List,
    MessageCircle,
    Phone,
    Plus,
    Search,
    Share2,
    ShieldCheck,
    ShoppingCart,
    Star,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { MarketHeader, ProductCard, SubcategoryChips } from "../components/shared";
import { CATEGORIES_LIST, MOCK_PRODUCTS, SIMILAR_LISTINGS } from "../constants/mocks";
import {
    collection,
    db,
    handleFirestoreError,
    onSnapshot,
    OperationType,
    query
} from '../firebase';
import { useAuth, useFavorites } from "../hooks";
import { Product } from "../types";

export const MarketCategories = ({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) => (
  <div className="mt-10">
    <div className="flex items-center justify-between px-6 mb-6">
      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Категории</h3>
      <button 
        onClick={() => onCategoryClick('Весь каталог')}
        className="text-brand-600 dark:text-brand-400 text-xs font-bold hover:underline"
      >
        Смотреть все
      </button>
    </div>
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-6">
      {CATEGORIES_LIST.map((cat) => (
        <div 
          key={cat.id} 
          onClick={() => onCategoryClick(cat.name)}
          className="flex flex-col items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className={`w-20 h-20 rounded-[2rem] ${(cat.color || '').split(' ')[0] || ''} dark:bg-slate-900 flex items-center justify-center ${(cat.color || '').split(' ')[1] || ''} shadow-xl shadow-slate-200/50 dark:shadow-none group-hover:scale-110 transition-transform border border-slate-50 dark:border-slate-800`}>
            <cat.icon size={32} strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 text-center leading-tight uppercase tracking-wider">{cat.name}</span>
        </div>
      ))}
    </div>
  </div>
);

export const PopularProductsSection = ({ onProductClick, favorites, toggleFavorite }: { onProductClick: (id: string) => void; favorites: string[]; toggleFavorite: (id: string) => void }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'slider'>('slider');
  const popularProducts = MOCK_PRODUCTS.filter(p => p.badge === 'popular' || p.rating >= 4.8);
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between px-6 mb-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Популярные</h3>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${viewMode === 'slider' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
          >
            <ChevronRight size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Слайд</span>
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      
      {viewMode === 'slider' ? (
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible">
          {popularProducts.map((product) => (
            <div key={product.id} className="w-[75vw] sm:w-auto shrink-0">
              <ProductCard 
                product={product} 
                onClick={() => onProductClick(product.id)} 
                viewMode="grid"
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={`px-6 pb-4 ${viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          : "flex flex-col gap-4"
        }`}>
          {popularProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductClick(product.id)} 
              viewMode={viewMode}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const NewProductsSection = ({ onProductClick, favorites, toggleFavorite }: { onProductClick: (id: string) => void; favorites: string[]; toggleFavorite: (id: string) => void }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const newProducts = MOCK_PRODUCTS.filter(p => p.badge === 'new' || p.id === 'm101' || p.id === 'm3' || p.id === 'm5');
  
  return (
    <div className="mt-8 px-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Новинки</h3>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        : "flex flex-col gap-4"
      }>
        {newProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onClick={() => onProductClick(product.id)} 
            viewMode={viewMode}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
          />
        ))}
      </div>
    </div>
  );
};

export const CatalogView = ({ onCategoryClick, onProductClick, onSearch, favorites, toggleFavorite }: { onCategoryClick: (cat: string) => void; onProductClick: (id: string) => void; onSearch?: (q: string) => void; favorites: string[]; toggleFavorite: (id: string) => void }) => {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-500">
      <MarketHeader onSearch={onSearch} />
      
      <div className="mt-2">
        <MarketCategories onCategoryClick={onCategoryClick} />
      </div>

      <PopularProductsSection onProductClick={onProductClick} favorites={favorites} toggleFavorite={toggleFavorite} />
      
      <NewProductsSection onProductClick={onProductClick} favorites={favorites} toggleFavorite={toggleFavorite} />
    </div>
  );
};

export const ProductListPage = ({ category, onBack, onProductClick, onAddClick, initialSearch = '', favorites, toggleFavorite }: { category: string; onBack: () => void; onProductClick: (id: string) => void; onAddClick?: () => void; initialSearch?: string; favorites: string[]; toggleFavorite: (id: string) => void }) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(pList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });
    return unsubscribe;
  }, []);

  const filteredProducts = (products.length > 0 ? products : MOCK_PRODUCTS).filter(p => {
    const matchesCategory = category === 'Весь каталог' || category === 'Новинки' || p.category === category;
    const safeName = (p.name || '').toLowerCase();
    const safeDesc = (p.description || '').toLowerCase();
    const safeQuery = (searchQuery || '').toLowerCase();
    const matchesSearch = safeName.includes(safeQuery) || safeDesc.includes(safeQuery);
    const matchesSubcategory = selectedSubcategory === 'Все' || p.badge === (selectedSubcategory === 'Новинки' ? 'new' : selectedSubcategory === 'Популярные' ? 'popular' : '');
    
    return matchesCategory && matchesSearch && matchesSubcategory;
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Загрузка товаров...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="bg-white dark:bg-slate-900 pb-4">
        <div className="px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{category}</h2>
          </div>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
        <div className="px-6 mt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск продуктов..." 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all dark:text-white"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-xl">
              <Filter size={18} />
            </button>
          </div>
        </div>
        <SubcategoryChips selected={selectedSubcategory} onSelect={setSelectedSubcategory} />
      </div>

      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {selectedSubcategory} <span className="text-slate-400 dark:text-slate-500 font-normal text-sm ml-1">({filteredProducts.length})</span>
          </h3>
          {onAddClick && (
            <button onClick={onAddClick} className="flex items-center gap-1 text-brand-600 dark:text-brand-400 text-xs font-bold">
              <Plus size={16} />
              <span>Добавить</span>
            </button>
          )}
        </div>
        
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          : "flex flex-col gap-4"
        }>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product.id)} 
                viewMode={viewMode}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400">В этой категории пока нет товаров</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MarketplacePage = ({ onProductClick, onAddClick }: { onProductClick: (id: string) => void; onAddClick: () => void }) => {
  const { currentUser } = useAuth();
  const { favorites, toggleFavorite } = useFavorites(currentUser?.uid);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [initialSearch, setInitialSearch] = useState('');

  const handleSearch = (query: string) => {
    setInitialSearch(query || '');
    setSelectedCategory('Весь каталог');
  };

  if (selectedCategory) {
    return (
      <ProductListPage 
        category={selectedCategory} 
        onBack={() => {
          setSelectedCategory(null);
          setInitialSearch('');
        }} 
        onProductClick={onProductClick}
        onAddClick={onAddClick}
        initialSearch={initialSearch}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
    );
  }

  return (
    <div className="transition-colors duration-500">
      <CatalogView onCategoryClick={setSelectedCategory} onProductClick={onProductClick} onSearch={handleSearch} favorites={favorites} toggleFavorite={toggleFavorite} />
    </div>
  );
};

export const ProductDetailsPage = ({ product, onChatClick, onProfileClick }: { product: Product; onChatClick?: (seller: any) => void; onProfileClick?: (userId: string) => void }) => (
  <div className="pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen">
    {/* Large Product Image */}
    <div className="relative h-[400px] w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-12">
      <img 
        src={product.image} 
        alt={product.name} 
        className="max-w-full max-h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-400 shadow-lg border border-white/20 dark:border-slate-700">
          <Share2 size={20} />
        </button>
        <button className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-slate-600 dark:text-slate-400 shadow-lg border border-white/20 dark:border-slate-700">
          <Heart size={20} />
        </button>
      </div>
    </div>

    {/* Product Info */}
    <div className="px-6 -mt-12 relative z-10">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg">В наличии</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">{product.category}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{product.name}</h2>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black text-slate-900 dark:text-white">{product.rating}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">(124 отзыва)</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{product.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-brand-600 dark:text-brand-400 leading-none">{product.price}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">{product.quantity}</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img 
                src={product.seller.avatar} 
                alt={product.seller.name} 
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-900 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-900 dark:text-white text-base">{product.seller.name}</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Официальный поставщик • 5 лет на рынке</p>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-black text-slate-900 dark:text-white">{product.seller.rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a 
              href={`tel:${product.seller.phone || '+996555123456'}`}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Phone size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Позвонить</span>
            </a>
            <button 
              onClick={() => onChatClick && onChatClick(product.seller)}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Чат</span>
            </button>
            <button 
              onClick={() => onProfileClick && onProfileClick(product.seller.id || 'system')}
              className="flex flex-col items-center justify-center gap-2 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                <User size={18} />
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Профиль</span>
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">Описание товара</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
            {product.description}
          </p>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Похожие товары</h3>
            <button className="text-brand-600 dark:text-brand-400 text-xs font-bold">Все</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {SIMILAR_LISTINGS.map(item => (
              <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-3 shrink-0 w-44 border border-slate-100 dark:border-slate-800 group cursor-pointer">
                <div className="aspect-square bg-white dark:bg-slate-900 rounded-2xl p-2 mb-3 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <h5 className="font-black text-slate-900 dark:text-white text-xs truncate mb-1">{item.name}</h5>
                <div className="flex items-center justify-between">
                  <span className="text-brand-600 dark:text-brand-400 font-black text-sm">{item.price}</span>
                  <button className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            <ShoppingCart size={24} />
          </button>
          <button className="flex-1 bg-brand-600 text-white rounded-3xl font-black text-base uppercase tracking-widest shadow-2xl shadow-brand-200 dark:shadow-brand-900/40 active:scale-95 transition-transform flex items-center justify-center gap-3">
            <span>Купить сейчас</span>
            <div className="w-1 h-1 bg-white/30 rounded-full" />
            <span>{product.price}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const SellPage = () => {
  return (
    <div className="pb-24 px-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Создать объявление</h2>
      
      <div className="space-y-6">
        {/* Photo Upload */}
        <div className="grid grid-cols-2 gap-4">
          <button className="aspect-square bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-colors">
            <Camera size={32} />
            <span className="text-xs font-bold">Камера</span>
          </button>
          <button className="aspect-square bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-colors">
            <ImageIcon size={32} />
            <span className="text-xs font-bold">Галерея</span>
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Название товара</label>
            <input type="text" placeholder="Например: Картофель Алладин" className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Цена (сом/кг)</label>
              <input type="number" placeholder="0" className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Вес (кг/тонн)</label>
              <input type="text" placeholder="Напр: 500 кг" className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Описание</label>
            <textarea rows={4} placeholder="Опишите ваш товар..." className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 resize-none text-slate-900 dark:text-white"></textarea>
          </div>
        </div>

        <button className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-100 dark:shadow-brand-900/20 active:scale-95 transition-transform">
          Опубликовать
        </button>
      </div>
    </div>
  );
};

