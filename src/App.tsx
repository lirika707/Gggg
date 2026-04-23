/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    Cloud,
    LayoutGrid,
    Wheat
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
    db,
    doc,
    getDoc,
    handleFirestoreError,
    onSnapshot,
    OperationType
} from './firebase';

import { BottomNav, ChatFAB, Header, UnifiedAICard } from "./components/shared";
import { MOCK_PRODUCTS, MOCK_USER } from "./constants/mocks";
import { clearDatabase, seedDatabase, useAuth, useParsedCrops, useWeather } from "./hooks";
import { I18nContext, TRANSLATIONS } from "./i18n";
import { AIAssistantPage, AIPhotoReport, AISearchPage } from "./pages/ai";
import { ChatListPage, ChatRoomPage, CommunitiesPage } from "./pages/community";
import { FAQSection, ListingsSection, ReviewsSection, WeatherDetailsPage } from "./pages/home";
import { MarketplacePage, ProductDetailsPage, SellPage } from "./pages/market";
import { BlogSection, FeedPage, NewsDetailsPage, NewsSection } from "./pages/news";
import { AdminPanel, LanguageSettingsPage, LoginPage, ProfilePage, ThemeSettingsPage } from "./pages/profile";
import { CommunityCategory, CommunityChat, Language, NewsItem, Product, Theme, UserProfile, View } from "./types";

// --- Types ---
// --- Mock Data ---
// --- Firebase Hooks ---
// --- Marketplace Components ---
// --- Main App ---

export default function App() {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [view, setView] = useState<View>('home');
  const weather = useWeather();
  const parsedCrops = useParsedCrops(currentUser?.uid);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lang') as Language) || 'ru';
    }
    return 'ru';
  });

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
      let isDark = t === 'dark';
      if (t === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(MOCK_PRODUCTS[0]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<CommunityCategory | null>(null);
  const [selectedChat, setSelectedChat] = useState<CommunityChat | null>(null);
  const [showAIReport, setShowAIReport] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<UserProfile>(MOCK_USER);

  useEffect(() => {
    const handleNavigate = (e: any) => setView(e.detail);
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            id: currentUser.uid,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            fullName: data.fullName || data.displayName || currentUser.displayName || 'Пользователь',
            name: data.fullName || data.displayName || currentUser.displayName || 'Пользователь',
            username: data.username || '',
            email: currentUser.email || '',
            phone: data.phone || '',
            avatar: data.photoURL || data.avatar || currentUser.photoURL || 'https://picsum.photos/seed/user/150/150',
            role: data.role || userRole || 'user',
            location: data.location || `${weather?.city || 'Бишкек'}, Кыргызстан`,
            bio: data.bio || '',
            followersCount: data.followersCount || 0,
            followingCount: data.followingCount || 0,
            postsCount: data.postsCount || 0,
            listingsCount: data.listingsCount || 0,
            soldCount: data.soldCount || 0,
            rating: data.rating || 0,
            verified: data.verified || false,
            quickRegistration: data.quickRegistration || false,
            registrationLevel: data.registrationLevel || 'full',
            provider: data.provider || 'email',
            joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Март 2024'
          });
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser, userRole]);

  const handleListingClick = async (id: string) => {
    // Try mock first for speed if it's a mock ID
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    if (mockProduct) {
      setSelectedProduct(mockProduct);
      setView('details');
      return;
    }

    // Otherwise fetch from Firestore
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        setView('details');
      } else {
        console.error("Product not found");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'products/' + id);
    }
  };

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news);
    setView('news_details');
  };

  const handleCommunityCategoryClick = (cat: CommunityCategory) => {
    setSelectedCommunityCategory(cat);
    setView('community_chats');
  };

  const handleChatClick = (chat: CommunityChat) => {
    setSelectedChat(chat);
    setView('chat_room');
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Загрузка...</p>
        </div>
      );
    }

    // Protected views that require login
    const protectedViews: View[] = ['sell', 'admin', 'chat_room', 'community_chats', 'feed'];
    if (protectedViews.includes(view) && !currentUser) {
      return <LoginPage onBack={() => setView('home')} />;
    }

    switch (view) {
      case 'home':
        return (
          <main className="pb-32">
            {/* Weather & Crops */}
            <div className="px-6 mt-6 space-y-4">
              {weather && (
                <button 
                  className="w-full text-left bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-4 text-white shadow-lg overflow-hidden relative cursor-pointer"
                  onClick={() => setView('weather_details')}
                >
                   <div className="relative z-10">
                     <h3 className="text-sm font-bold opacity-80">Погода</h3>
                     <p className="text-3xl font-black">{weather.temp}°C</p>
                     <p className="text-xs">{weather.desc}</p>
                   </div>
                   <Cloud className="absolute right-4 top-2 text-white/30" size={64} />
                </button>
              )}
              {parsedCrops.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">{t('my_cultures')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedCrops.map(crop => (
                      <span key={crop} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full text-xs font-bold">{crop}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 mt-6">
              <UnifiedAICard onScanClick={() => setShowAIReport(true)} />
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => setView('market')}>
                <span className="text-emerald-600 dark:text-emerald-400 mb-2"><Wheat size={24} /></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('my_cultures')}</h3>
              </div>
            </div>
            <div className="relative z-20 mt-6 bg-white dark:bg-slate-950 rounded-t-[4rem] pt-12">
              <ListingsSection onListingClick={handleListingClick} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <NewsSection onNewsClick={handleNewsClick} />
                <BlogSection onPostClick={handleNewsClick} />
                <ReviewsSection />
                <FAQSection />
              </div>
            </div>
          </main>
        );
      case 'market':
        return <MarketplacePage onProductClick={handleListingClick} onAddClick={() => setView('sell')} />;
      case 'admin':
        return userRole === 'admin' ? (
          <AdminPanel 
            onSeed={seedDatabase} 
            onClear={clearDatabase} 
            onUserClick={(u) => {
              setSelectedUserProfile(u);
              setView('profile');
            }}
          />
        ) : <div className="p-12 text-center">Доступ запрещен</div>;
      case 'details':
        return selectedProduct ? (
          <ProductDetailsPage 
            product={selectedProduct} 
            onChatClick={(seller) => {
              setSelectedChat({
                id: 'seller-' + selectedProduct.id,
                name: seller.name,
                lastMessage: 'Здравствуйте! Я по поводу ' + selectedProduct.name,
                members: 2,
                image: seller.avatar
              });
              setView('chat_room');
            }}
          />
        ) : null;
      case 'news_details':
        return selectedNews ? <NewsDetailsPage news={selectedNews} /> : null;
      case 'ai':
        return <AIAssistantPage setView={setView} weather={weather} />;
      case 'ai_search':
        return <AISearchPage setView={setView} onResultClick={(item) => {
            if (item.type === 'product') {
              setSelectedProduct(item);
              setView('details');
            } else if (item.type === 'news') {
              setSelectedNews(item);
              setView('news_details');
            } else if (item.type === 'community') {
              setSelectedCommunityCategory(item);
              setView('community_chats');
            } else if (item.type === 'user') {
              const fetchAndShowProfile = async () => {
                try {
                  const docSnap = await getDoc(doc(db, 'users', item.id));
                  if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSelectedUserProfile({
                      id: item.id,
                      fullName: data.displayName || 'Пользователь',
                      name: data.displayName || 'Пользователь',
                      email: data.email || '',
                      avatar: data.photoURL || 'https://picsum.photos/seed/user/150/150',
                      role: data.role || 'user',
                      location: data.location || `${weather?.city || 'Бишкек'}, Кыргызстан`,
                      bio: data.bio || '',
                      followersCount: data.followersCount || 0,
                      followingCount: data.followingCount || 0,
                      listingsCount: data.listingsCount || 0,
                      soldCount: data.soldCount || 0,
                      rating: data.rating || 0,
                      joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Март 2024'
                    });
                    setView('profile');
                  }
                } catch (e) {
                  console.error(e);
                }
              };
              fetchAndShowProfile();
            }
          }} 
        />;
      case 'communities':
        return <CommunitiesPage onCategoryClick={handleCommunityCategoryClick} />;
      case 'community_chats':
        return selectedCommunityCategory ? <ChatListPage category={selectedCommunityCategory} onChatClick={handleChatClick} /> : null;
      case 'chat_room':
        return selectedChat ? <ChatRoomPage chat={selectedChat} /> : null;
      case 'sell':
        return <SellPage />;
      case 'login':
        return <LoginPage onBack={() => setView('home')} />;
      case 'feed':
        return <FeedPage onProfileClick={(userId) => {
          const fetchAndShowProfile = async () => {
            const docSnap = await getDoc(doc(db, 'users', userId));
            if (docSnap.exists()) {
              const data = docSnap.data();
              setSelectedUserProfile({
                id: userId,
                fullName: data.displayName || 'Пользователь',
                name: data.displayName || 'Пользователь',
                email: data.email || '',
                avatar: data.photoURL || 'https://picsum.photos/seed/user/150/150',
                role: data.role || 'user',
                location: data.location || `${weather?.city || 'Бишкек'}, Кыргызстан`,
                bio: data.bio || '',
                followersCount: data.followersCount || 0,
                followingCount: data.followingCount || 0,
                listingsCount: data.listingsCount || 0,
                soldCount: data.soldCount || 0,
                rating: data.rating || 0,
                joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Март 2024'
              });
              setView('profile');
            }
          };
          fetchAndShowProfile();
        }} />;
      case 'profile':
        return selectedUserProfile ? (
          <ProfilePage 
            user={selectedUserProfile} 
            onUpdateUser={(u) => {
              if (u.id === user.id) setUser(u);
              setSelectedUserProfile(u);
            }} 
            theme={theme} 
            setTheme={setTheme} 
            onSellClick={() => setView('sell')} 
            isAuthenticated={!!currentUser}
            onLoginClick={() => setView('login')}
            isAdmin={userRole === 'admin'}
            setView={setView}
          />
        ) : null;
      case 'weather_details':
        return <WeatherDetailsPage onBack={() => setView('home')} crops={parsedCrops} />;
      case 'theme_settings':
        return <ThemeSettingsPage 
          currentTheme={theme} 
          onSave={(t) => { setTheme(t); setView('settings'); }} 
          onCancel={() => setView('settings')}
        />;
      case 'lang_settings':
        return <LanguageSettingsPage onCancel={() => setView('settings')} />;
      case 'settings':
        return <ProfilePage 
          user={user} 
          onUpdateUser={setUser} 
          theme={theme} 
          setTheme={setTheme} 
          onSellClick={() => setView('sell')} 
          isAuthenticated={!!currentUser}
          onLoginClick={() => setView('login')}
          isAdmin={userRole === 'admin'}
          setView={setView}
        />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 px-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Раздел в разработке</h3>
            <p className="text-sm mt-2">Мы работаем над тем, чтобы сделать этот раздел доступным как можно скорее.</p>
            <button 
              onClick={() => setView('home')}
              className="mt-6 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold"
            >
              Вернуться на главную
            </button>
          </div>
        );
    }
  };

  return (
    <I18nContext.Provider value={{lang, setLang, t}}>
      <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 w-full relative transition-colors duration-300">
        <div className="max-w-[800px] xl:max-w-[1200px] mx-auto bg-white dark:bg-slate-950 md:shadow-2xl relative min-h-[100dvh] flex flex-col md:border-x md:border-slate-100 dark:border-slate-800">
          <Header 
          title={
            view === 'details' ? (selectedProduct?.name || t('details')) : 
            view === 'market' ? t('market') : 
            view === 'home' ? t('home') : 
            view === 'ai' ? t('ai') : 
            view === 'communities' ? t('communities') :
            view === 'community_chats' ? (selectedCommunityCategory?.name || t('chats')) :
            view === 'chat_room' ? (selectedChat?.name || 'Чат') :
            view === 'news_details' ? t('news') :
            view === 'sell' ? t('sell') :
            view === 'settings' ? t('profile') : 
            view === 'theme_settings' ? t('theme') :
            view === 'lang_settings' ? t('language') :
            view === 'feed' ? t('feed') :
            view === 'profile' ? (selectedUserProfile?.name || t('profile')) : 'EGIN'
          } 
          location={view === 'market' ? `${weather?.city || 'Бишкек'}, Кыргызстан` : undefined}
          showBack={view !== 'home'}
          weather={weather}
          onSearchClick={['home', 'market', 'ai', 'feed', 'communities'].includes(view) ? () => setView('ai_search') : undefined}
          onWeatherClick={() => setView('weather_details')}
          onBack={() => {
            if (view === 'details') setView('market');
            else if (view === 'news_details') setView('home');
            else if (view === 'community_chats') setView('communities');
            else if (view === 'chat_room') setView('community_chats');
            else if (view === 'sell') setView('market');
            else if (view === 'ai') setView('home');
            else if (view === 'market') setView('home');
            else if (view === 'communities') setView('home');
            else if (view === 'theme_settings') setView('settings');
            else if (view === 'lang_settings') setView('settings');
            else if (view === 'settings') setView('home');
            else if (view === 'login') setView('home');
            else if (view === 'feed') setView('home');
            else if (view === 'profile') setView('feed');
            else setView('home');
          }}
          onMessageClick={() => setView('communities')}
          onCartClick={() => setView('market')}
          onAddClick={view === 'market' ? () => setView('sell') : undefined}
          isHome={view === 'home'}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (selectedProduct?.id || '') + (selectedNews?.id || '') + (selectedChat?.id || '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showAIReport && <AIPhotoReport onClose={() => setShowAIReport(false)} />}
        </AnimatePresence>

        {view === 'home' && (
          <>
            <ChatFAB />
          </>
        )}

        <BottomNav 
          activeTab={view === 'community_chats' || view === 'chat_room' ? 'communities' : view} 
          onTabChange={(t) => setView(t)} 
          isAdmin={userRole === 'admin'}
        />
        </div>
      </div>
    </I18nContext.Provider>
  );
}
