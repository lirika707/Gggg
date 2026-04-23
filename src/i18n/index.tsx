import React from 'react';
import { Language } from '../types';


export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  ru: {
    home: 'Главная',
    market: 'Рынок',
    ai: 'AI Помощник',
    communities: 'Сообщества',
    news: 'Новости',
    profile: 'Профиль',
    sell: 'Продать',
    details: 'Детали',
    chats: 'Чаты',
    feed: 'Лента',
    search: 'Поиск по товарам, людям...',
    lang_ru: 'Русский',
    lang_kg: 'Кыргызча',
    language: 'Язык',
    logout: 'Выйти',
    login: 'Войти',
    theme: 'Тема',
    my_cultures: 'Мои Культуры',
    admin_panel: 'Панель админа',
    save: 'Сохранить',
    cancel: 'Отмена'
  },
  kg: {
    home: 'Башкы бет',
    market: 'Базар',
    ai: 'AI Жардамчы',
    communities: 'Коомдор',
    news: 'Жаңылыктар',
    profile: 'Профиль',
    sell: 'Сатуу',
    details: 'Толук маалымат',
    chats: 'Чаттар',
    feed: 'Түрмөк',
    search: 'Товарлар, адамдар боюнча издөө...',
    lang_ru: 'Орусча',
    lang_kg: 'Кыргызча',
    language: 'Тил',
    logout: 'Чыгуу',
    login: 'Кирүү',
    theme: 'Тема',
    my_cultures: 'Менин өсүмдүктөрүм',
    admin_panel: 'Админ панели',
    save: 'Сактоо',
    cancel: 'Жокко чыгаруу'
  }
};

export const I18nContext = React.createContext<{lang: Language, setLang: (l: Language) => void, t: (key: string) => string}>({
  lang: 'ru',
  setLang: () => {},
  t: (k) => k
});

export const useI18n = () => React.useContext(I18nContext);

