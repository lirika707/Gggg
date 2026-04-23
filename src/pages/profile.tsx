import {
    Activity,
    Bell,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Database,
    Edit3,
    FileText,
    Globe,
    Heart,
    Image as ImageIcon,
    LayoutGrid,
    LogOut,
    Mail,
    MapPin,
    Moon,
    Newspaper,
    Package,
    Phone,
    Plus,
    Search,
    Settings,
    Share2,
    Shield,
    ShieldCheck,
    Sparkles,
    Star,
    Sun,
    Trash2,
    User,
    Users,
    X
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { ProductCard } from "../components/shared";
import { MOCK_ORDERS, MOCK_PRODUCTS } from "../constants/mocks";
import {
    addDoc,
    collection,
    db,
    deleteDoc,
    doc,
    getDocs,
    handleFirestoreError,
    increment,
    onSnapshot,
    OperationType,
    serverTimestamp,
    updateDoc
} from '../firebase';
import { useAuth, useFavorites, useFollows, usePosts } from "../hooks";
import { useI18n } from "../i18n";
import {
    getAuthErrorMessage,
    handleSocialLoginDemo,
    loginWithUsername,
    logOutAuth,
    quickRegisterWithUsername,
    registerWithUsername,
    signInAnonymouslyAuth,
    signInWithGoogleAuth
} from '../services/auth';
import { Language, Theme, UserProfile, View } from "../types";
import { cn } from "../utils";

export const LanguageSettingsPage = ({ onCancel }: { onCancel: () => void }) => {
  const { lang, setLang, t } = useI18n();
  const [localLang, setLocalLang] = useState<Language>(lang);

  return (
    <div className="pb-24 px-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('language')}</h2>
      
      <div className="space-y-4 mb-8">
        {[
          { id: 'ru', label: t('lang_ru'), icon: Globe },
          { id: 'kg', label: t('lang_kg'), icon: Globe }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setLocalLang(item.id as Language)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${localLang === item.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-brand-200 bg-white dark:bg-slate-900'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${localLang === item.id ? 'bg-brand-100 dark:bg-brand-800 text-brand-600 dark:text-brand-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>
                <item.icon size={24} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-lg">{item.label}</span>
            </div>
            {localLang === item.id && <CheckCircle2 size={24} className="text-brand-500" />}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          {t('cancel')}
        </button>
        <button onClick={() => { setLang(localLang); onCancel(); }} className="flex-1 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:scale-[0.98] transition-all">
          {t('save')}
        </button>
      </div>
    </div>
  );
};

export const ThemeSettingsPage = ({ currentTheme, onSave, onCancel }: { currentTheme: Theme; onSave: (t: Theme) => void; onCancel: () => void }) => {
  const [localTheme, setLocalTheme] = useState<Theme>(currentTheme);

  return (
    <div className="pb-24 px-6 pt-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Настройка темы</h2>
      <div className="grid grid-cols-1 gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-3xl mb-6">
        {[
          { id: 'light', label: 'Светлая', icon: Sun },
          { id: 'dark', label: 'Темная', icon: Moon },
          { id: 'system', label: 'Системная', icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setLocalTheme(t.id as Theme)}
            className={`flex items-center justify-between gap-4 py-4 px-6 rounded-2xl transition-all ${
              localTheme === t.id 
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
                <t.icon size={20} />
                <span className="text-sm font-bold">{t.label}</span>
            </div>
            {localTheme === t.id && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold">Отмена</button>
        <button onClick={() => onSave(localTheme)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold">Сохранить</button>
      </div>
    </div>
  );
};

export const ProfilePage = ({ user, onUpdateUser, theme, setTheme, onSellClick, isAuthenticated, onLoginClick, isAdmin, setView }: { user: UserProfile; onUpdateUser: (u: UserProfile) => void; theme: Theme; setTheme: (t: Theme) => void; onSellClick: () => void; isAuthenticated: boolean; onLoginClick: () => void; isAdmin?: boolean; setView: (v: View) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'blog' | 'favorites'>('listings');
  const { currentUser, userRole } = useAuth();
  const { favorites, toggleFavorite } = useFavorites(currentUser?.uid);
  const isCurrentUser = currentUser?.uid === user.id;
  const { isFollowing, toggleFollow } = useFollows(currentUser?.uid, user.id);
  const { posts, loading: postsLoading } = usePosts(user.id);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveUser, setLiveUser] = useState<UserProfile>(user);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setEditedUser({ ...editedUser, avatar: canvas.toDataURL('image/jpeg', 0.7) });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!user.id) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLiveUser({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          fullName: data.fullName || data.displayName || 'Пользователь',
          name: data.fullName || data.displayName || 'Пользователь',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.photoURL || data.avatar || 'https://picsum.photos/seed/user/150/150',
          role: data.role || 'user',
          location: data.location || 'Бишкек, Кыргызстан',
          bio: data.bio || '',
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          listingsCount: data.listingsCount || 0,
          postsCount: data.postsCount || 0,
          soldCount: data.soldCount || 0,
          rating: data.rating || 0,
          verified: data.verified || false,
          joinedDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Март 2024'
        });
      }
    });
    return () => unsubscribe();
  }, [user.id]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const fullName = `${editedUser.firstName} ${editedUser.lastName}`;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        fullName: fullName,
        displayName: fullName,
        photoURL: editedUser.avatar,
        avatar: editedUser.avatar,
        location: editedUser.location,
        bio: editedUser.bio,
        phone: editedUser.phone,
        quickRegistration: false,
        registrationLevel: 'full',
        updatedAt: serverTimestamp()
      });
      onUpdateUser({ ...editedUser, fullName, name: fullName, quickRegistration: false, registrationLevel: 'full' });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + currentUser.uid);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser || !newPostText.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Пользователь',
        userAvatar: currentUser.photoURL || 'https://picsum.photos/seed/user/150/150',
        content: newPostText,
        image: newPostImage || null,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'users', currentUser.uid), {
        postsCount: increment(1)
      });
      setNewPostText('');
      setNewPostImage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      if (currentUser) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          postsCount: increment(-1)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'posts/' + postId);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6">
          <User size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Вы не вошли в систему</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Войдите, чтобы управлять своим профилем, заказами и объявлениями.</p>
        <button 
          onClick={onLoginClick}
          className="w-full max-w-xs bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-100 active:scale-95 transition-transform"
        >
          Войти или зарегистрироваться
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="pb-24 px-6 pt-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Редактировать профиль</h2>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img 
                src={editedUser.avatar} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-brand-50 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              />
              <div 
                className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-brand-700 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Имя</label>
                <input 
                  type="text" 
                  value={editedUser.firstName}
                  onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                  className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Фамилия</label>
                <input 
                  type="text" 
                  value={editedUser.lastName}
                  onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                  className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" 
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Телефон</label>
              <input 
                type="tel" 
                value={editedUser.phone}
                onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Био</label>
              <textarea 
                value={editedUser.bio}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white h-24 resize-none" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Локация</label>
              <input 
                type="text" 
                value={editedUser.location}
                onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                className="w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white" 
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold active:scale-95 transition-transform"
            >
              Отмена
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-100 active:scale-95 transition-transform"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-white dark:bg-slate-950 min-h-screen">
      {/* Header Section */}
      <div className="px-6 pt-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={liveUser.avatar} 
                alt="Avatar" 
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 shadow-xl bg-brand-50 object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{liveUser.fullName}</h2>
                  {liveUser.verified && (
                    <div className="bg-brand-500 text-white p-0.5 rounded-full shadow-sm shadow-brand-500/20">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                {isCurrentUser ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                  >
                    Изменить
                  </button>
                ) : (
                  <button 
                    onClick={toggleFollow}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 shadow-md",
                      isFollowing 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-none" 
                        : "bg-emerald-500 text-white shadow-emerald-500/20"
                    )}
                  >
                    {isFollowing ? 'Подписан' : 'Подписаться'}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">{liveUser.role}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={12} className="text-emerald-500" />
                  <span className="font-medium">{liveUser.location}</span>
                </div>
                {liveUser.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Phone size={12} className="text-emerald-500" />
                    <span className="font-medium">{liveUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Mail size={12} className="text-emerald-500" />
                  <span className="font-medium">{liveUser.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => logOutAuth()}
              className="p-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-red-500 rounded-2xl transition-colors"
              title="Выйти"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Quick Registration Prompt */}
        {isCurrentUser && liveUser.quickRegistration && (
          <div className="mx-6 mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-100">Заполните профиль полностью</h4>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Добавьте имя и фото, чтобы повысить доверие покупателей.</p>
            </div>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-amber-500 text-white text-[10px] font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Заполнить
            </button>
          </div>
        )}

        {liveUser.bio && (
          <p className="px-1 text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {liveUser.bio}
          </p>
        )}

        {/* Horizontal Stats Section */}
        <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50 dark:border-slate-900/50 mb-8">
          <div className="text-center">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{liveUser.listingsCount || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Объявления</p>
          </div>
          <div className="text-center border-x border-slate-50 dark:border-slate-900/50">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{liveUser.soldCount || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Продано</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              <p className="text-2xl font-black text-slate-900 dark:text-white">{liveUser.rating || 0}</p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Рейтинг</p>
          </div>
          <div className="text-center pt-4">
            <p className="text-xl font-black text-slate-900 dark:text-white">{liveUser.followersCount || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Подписчики</p>
          </div>
          <div className="text-center pt-4 border-x border-slate-50 dark:border-slate-900/50">
            <p className="text-xl font-black text-slate-900 dark:text-white">{liveUser.followingCount || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Подписки</p>
          </div>
          <div className="text-center pt-4">
            <p className="text-xl font-black text-slate-900 dark:text-white">{liveUser.postsCount || 0}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Посты</p>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="px-6 mt-10">
        <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'listings', label: 'Объявления' },
            { id: 'orders', label: 'Заказы' },
            { id: 'blog', label: 'Блог' },
            { id: 'favorites', label: 'Избранное' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabProfile" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeTab === 'listings' && (
            <>
              {isCurrentUser && (
                <button 
                  onClick={onSellClick}
                  className="col-span-full py-5 bg-emerald-50/50 dark:bg-emerald-950/10 border-2 border-dashed border-emerald-200 dark:border-emerald-900/30 rounded-3xl flex items-center justify-center gap-3 text-emerald-600 font-bold mb-4 active:scale-95 transition-transform"
                >
                  <Plus size={22} />
                  <span>Добавить новое объявление</span>
                </button>
              )}
              {MOCK_PRODUCTS.slice(0, 2).map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-emerald-100 transition-colors">
                  <img src={item.image} referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                    <p className="text-emerald-600 font-black text-xs mt-1">{item.price}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </>
          )}

          {activeTab === 'favorites' && (
            MOCK_PRODUCTS.filter(p => favorites.includes(p.id)).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => {}} 
                viewMode="list"
                isFavorite={true}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
              />
            ))
          )}
          
          {activeTab === 'orders' && (
            MOCK_ORDERS.map(order => (
              <div key={order.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <img src={order.image} referrerPolicy="no-referrer" className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{order.productName}</h4>
                    <span className="text-[10px] px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-full font-black uppercase tracking-tighter">
                      {order.status === 'delivered' ? 'Доставлено' : order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-emerald-600 font-black text-xs">{order.price}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{order.date}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {activeTab === 'blog' && (
            <div className="col-span-full space-y-4">
              {isCurrentUser && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 mb-4">
                  <textarea 
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Напишите что-нибудь в блог..."
                    className="w-full bg-white dark:bg-slate-950 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white resize-none h-24"
                  />
                  {newPostImage && (
                    <div className="mt-3 relative">
                      <img src={newPostImage} className="w-full h-32 object-cover rounded-2xl" />
                      <button 
                        onClick={() => setNewPostImage('')}
                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <button 
                      onClick={() => {
                        const url = window.prompt('Введите URL изображения:');
                        if (url) setNewPostImage(url);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <ImageIcon size={20} />
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={isSubmitting || !newPostText.trim()}
                      className="px-6 py-2 bg-emerald-500 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Опубликовать'}
                    </button>
                  </div>
                </div>
              )}

              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                    {isCurrentUser && (
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {post.image && (
                      <img src={post.image} className="mt-4 w-full h-40 object-cover rounded-2xl" />
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <p className="text-[10px] text-slate-400 font-bold">
                        {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Только что'}
                      </p>
                      <div className="flex gap-4">
                        <button className="text-slate-400 hover:text-emerald-500 transition-colors">
                          <Heart size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-emerald-500 transition-colors">
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                    <Newspaper size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">У пользователя пока нет записей в блоге</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-6 mt-12 pb-12">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Настройки</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {[
            { label: 'Настройки профиля', icon: User },
            { label: 'Упаковка и доставка', icon: Package },
            { label: 'Язык (Русский)', icon: Globe },
            { label: 'Уведомления', icon: Bell },
          ].map((item, i) => (
            <button key={i} className={`w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${i !== 3 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                  <item.icon size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          ))}
          
          <button
            onClick={() => setView('theme_settings')}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-50 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                <Moon size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Тема оформления</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
          </button>

          <button
            onClick={() => setView('lang_settings')}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-50 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl">
                <Globe size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Язык / Тил</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
          </button>

          {/* Admin Panel Button */}
          {isCurrentUser && (liveUser.role === 'admin' || userRole === 'admin' || isAdmin) && (
            <div className="px-6 py-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin' }))}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 dark:shadow-white/10 active:scale-95 transition-transform flex items-center justify-center gap-3"
              >
                <Settings size={20} />
                <span>Управление сайтом</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminPanel = ({ onSeed, onClear, onUserClick }: { onSeed: () => void; onClear: () => void; onUserClick: (u: UserProfile) => void }) => {
  const [stats, setStats] = useState({ products: 0, services: 0, users: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'dashboard' | 'users'>('dashboard');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pSnap = await getDocs(collection(db, 'products'));
        const sSnap = await getDocs(collection(db, 'services'));
        const uSnap = await getDocs(collection(db, 'users'));
        setStats({
          products: pSnap.size,
          services: sSnap.size,
          users: uSnap.size
        });
        
        const usersList = uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setUsers(usersList);
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchStats();
    
    // Set up real-time listeners for stats
    const unsubP = onSnapshot(collection(db, 'products'), (s) => setStats(prev => ({ ...prev, products: s.size })));
    const unsubS = onSnapshot(collection(db, 'services'), (s) => setStats(prev => ({ ...prev, services: s.size })));
    const unsubU = onSnapshot(collection(db, 'users'), (s) => {
      setStats(prev => ({ ...prev, users: s.size }));
      const usersList = s.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersList);
    });
    
    return () => {
      unsubP();
      unsubS();
      unsubU();
    };
  }, []);

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateUser = async (u: UserProfile) => {
    if (!u.id) return;
    try {
      const fullName = `${u.firstName} ${u.lastName}`;
      await updateDoc(doc(db, 'users', u.id), {
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: fullName,
        displayName: fullName,
        email: u.email,
        phone: u.phone,
        location: u.location,
        bio: u.bio,
        verified: u.verified,
        registrationLevel: u.registrationLevel || 'full',
        followersCount: u.followersCount || 0,
        followingCount: u.followingCount || 0,
        postsCount: u.postsCount || 0,
        updatedAt: serverTimestamp()
      });
      setEditingUser(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + u.id);
    }
  };

  if (editingUser) {
    return (
      <div className="pb-24 px-6 pt-6">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setEditingUser(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Редактировать пользователя</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
            <img src={editingUser.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white">{editingUser.fullName}</h4>
              <p className="text-xs text-slate-400">{editingUser.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Имя</label>
                <input 
                  type="text" 
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Фамилия</label>
                <input 
                  type="text" 
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="email" 
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Телефон</label>
              <input 
                type="tel" 
                value={editingUser.phone}
                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Локация</label>
              <input 
                type="text" 
                value={editingUser.location}
                onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Био</label>
              <textarea 
                value={editingUser.bio}
                onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Уровень регистрации</label>
                <select 
                  value={editingUser.registrationLevel || 'full'}
                  onChange={(e) => setEditingUser({ ...editingUser, registrationLevel: e.target.value as any })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white"
                >
                  <option value="quick">Быстрая</option>
                  <option value="full">Полная</option>
                  <option value="social">Социальная</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Провайдер</label>
                <input 
                  type="text" 
                  value={editingUser.provider || 'email'}
                  readOnly
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Подписчики</label>
                <input 
                  type="number" 
                  value={editingUser.followersCount || 0}
                  onChange={(e) => setEditingUser({ ...editingUser, followersCount: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Подписки</label>
                <input 
                  type="number" 
                  value={editingUser.followingCount || 0}
                  onChange={(e) => setEditingUser({ ...editingUser, followingCount: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Посты</label>
                <input 
                  type="number" 
                  value={editingUser.postsCount || 0}
                  onChange={(e) => setEditingUser({ ...editingUser, postsCount: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 px-4 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">Верификация</h5>
                <p className="text-[10px] text-slate-400">Синяя галочка в профиле</p>
              </div>
              <button 
                onClick={() => setEditingUser({ ...editingUser, verified: !editingUser.verified })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  editingUser.verified ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  editingUser.verified ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>

          <button 
            onClick={() => handleUpdateUser(editingUser)}
            className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-100 active:scale-95 transition-transform"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 pt-6">
      <div className="bg-slate-900 rounded-[40px] p-8 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Админ Панель</h2>
          <p className="text-slate-400 text-sm">Управление контентом и пользователями сайта.</p>
        </div>
        <Shield className="absolute -bottom-6 -right-6 text-slate-800 opacity-20" size={160} />
      </div>

      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
        <button 
          onClick={() => setView('dashboard')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'dashboard' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
          )}
        >
          Дашборд
        </button>
        <button 
          onClick={() => setView('users')}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'users' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
          )}
        >
          Пользователи
        </button>
      </div>

      {view === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
                <LayoutGrid size={24} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.products}</h4>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Товаров</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Activity size={24} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.services}</h4>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Услуг</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Users size={24} />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stats.users}</h4>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">Пользователей</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Быстрые действия</h3>
            <button 
              onClick={onSeed}
              className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-100 transition-all"
            >
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Database size={24} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-900 dark:text-white">Заполнить базу данных</h4>
                <p className="text-xs text-slate-400">Добавить 150 тестовых товаров и услуг.</p>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>

            <button 
              onClick={onClear}
              className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-brand-100 transition-all"
            >
              <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400">
                <X size={24} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-slate-900 dark:text-white">Очистить базу (DEV)</h4>
                <p className="text-xs text-slate-400">Удалить все товары и услуги.</p>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <img 
                  src={u.avatar} 
                  alt="" 
                  className="w-12 h-12 rounded-2xl object-cover bg-slate-100"
                  onClick={() => onUserClick(u)}
                />
                <div className="flex-1 min-w-0" onClick={() => onUserClick(u)}>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{u.fullName}</h4>
                    {u.verified && (
                      <div className="bg-brand-500 text-white p-0.5 rounded-full">
                        <Check size={8} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                </div>
                <button 
                  onClick={() => setEditingUser(u)}
                  className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-brand-600 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Пользователи не найдены</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const LoginPage = ({ onBack }: { onBack?: () => void }) => {
  const [regType, setRegType] = useState<'login' | 'quick' | 'full'>('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Бишкек, Кыргызстан');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickRegResult, setQuickRegResult] = useState<{username: string, password: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (regType === 'full' && password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      if (regType === 'quick') {
        const { password: generatedPassword } = await quickRegisterWithUsername(login);
        setQuickRegResult({ username: login, password: generatedPassword });
        setLoading(false);
        return;
      } else if (regType === 'full') {
        await registerWithUsername(login, password, firstName, lastName, phone, location, bio);
      } else {
        await loginWithUsername(login, password);
      }
      if (onBack) onBack();
    } catch (err: any) {
      setError(getAuthErrorMessage(err) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await signInWithGoogleAuth();
        if (onBack) onBack();
      } else if (provider === 'guest') {
        await signInAnonymouslyAuth();
        if (onBack) onBack();
      } else {
        await handleSocialLoginDemo(provider);
      }
    } catch (err: any) {
      setError(getAuthErrorMessage(err) || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (quickRegResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center bg-slate-50 dark:bg-slate-950 py-12">
        <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200 dark:shadow-emerald-900/20">
          <Check size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
          Регистрация успешна!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">
          Сохраните эти данные для входа в будущем.
        </p>
        
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-4 mb-8">
          <div className="text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Логин</label>
            <div className="flex items-center justify-between mt-1 bg-slate-50 dark:bg-slate-950 rounded-2xl py-3 px-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{quickRegResult.username}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(quickRegResult.username);
                alert("Логин скопирован!");
              }} className="text-brand-600 text-xs font-bold">Копировать</button>
            </div>
          </div>
          <div className="text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
            <div className="flex items-center justify-between mt-1 bg-slate-50 dark:bg-slate-950 rounded-2xl py-3 px-4">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{quickRegResult.password}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(quickRegResult.password);
                alert("Пароль скопирован!");
              }} className="text-brand-600 text-xs font-bold">Копировать</button>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onBack && onBack()}
          className="w-full max-w-sm bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-200 active:scale-95 transition-all"
        >
          Продолжить
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-8 text-center bg-slate-50 dark:bg-slate-950 py-12">
      <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-brand-200 dark:shadow-brand-900/20">
        <Shield size={40} className="text-white" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
        {regType === 'login' ? 'Добро пожаловать' : regType === 'quick' ? 'Быстрый старт' : 'Полная регистрация'}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium text-sm">
        {regType === 'login' ? 'Войдите в свой аккаунт EGIN' : regType === 'quick' ? 'Начните быстро, а профиль заполните позже' : 'Создайте полноценный аккаунт'}
      </p>

      {/* Auth Mode Tabs */}
      <div className="w-full max-w-sm flex gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
        <button 
          onClick={() => setRegType('login')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            regType === 'login' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
          )}
        >
          Вход
        </button>
        <button 
          onClick={() => setRegType('quick')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            regType === 'quick' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
          )}
        >
          Быстрая
        </button>
        <button 
          onClick={() => setRegType('full')}
          className={cn(
            "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
            regType === 'full' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"
          )}
        >
          Полная
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {regType === 'quick' && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Логин (от 3 символов)"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        )}

        {regType === 'full' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
          </div>
        )}
        
        {regType !== 'quick' && (
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Логин или Email"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        )}

        {regType === 'full' && (
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="tel" 
              placeholder="Номер телефона"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        )}

        {regType !== 'quick' && (
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        )}

        {regType === 'full' && (
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            />
          </div>
        )}

        {regType === 'full' && (
          <>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Локация (например, Бишкек)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
              <textarea 
                placeholder="О себе (био)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3.5 pl-12 pr-4 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all h-24 resize-none"
              />
            </div>
          </>
        )}

        {error && <p className="text-xs text-red-500 font-bold">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-200 dark:shadow-brand-900/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Загрузка...' : regType === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>

      {/* Social Auth Section */}
      <div className="w-full max-w-sm mt-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Войти через</span>
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            <span className="text-xs">Google</span>
          </button>
          
          <button 
            onClick={() => handleSocialLogin('guest')}
            className="flex items-center justify-center gap-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 py-3 rounded-2xl font-bold text-brand-600 dark:text-brand-400 shadow-sm active:scale-95 transition-all hover:bg-brand-100 dark:hover:bg-brand-800"
          >
            <User size={16} />
            <span className="text-xs">Гость</span>
          </button>

          <button 
            onClick={() => handleSocialLogin('yandex')}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center text-[10px] text-white font-black">Я</div>
            <span className="text-xs">Yandex</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('vk')}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] text-white font-black">VK</div>
            <span className="text-xs">VK</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('linkedin')}
            className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-4 h-4 bg-blue-800 rounded-sm flex items-center justify-center text-[10px] text-white font-black">in</div>
            <span className="text-xs">LinkedIn</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('instagram')}
            className="col-span-2 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 rounded-2xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-4 h-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-sm"></div>
            <span className="text-xs">Instagram</span>
          </button>
        </div>
      </div>

      {onBack && (
        <button 
          onClick={onBack}
          className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest"
        >
          Пропустить
        </button>
      )}
    </div>
  );
};

