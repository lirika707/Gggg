import {
    Apple,
    Beef,
    Milk,
    ShoppingBag,
    Sprout,
    Truck
} from 'lucide-react';
import { CommunityCategory, Listing, Message, NewsItem, Order, Product, UserProfile } from '../types';


export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'm1',
    name: 'Картофель "Алладин"',
    price: '16 сом/кг',
    quantity: '500 кг',
    location: 'Чуйская обл.',
    rating: 4.8,
    image: 'https://picsum.photos/seed/potato1/400/300'
  },
  {
    id: 'm2',
    name: 'Лук репчатый',
    price: '12 сом/кг',
    quantity: '1 тонна',
    location: 'Ошская обл.',
    rating: 4.6,
    image: 'https://picsum.photos/seed/onion/400/300'
  },
  {
    id: 'm3',
    name: 'Помидоры "Бычье сердце"',
    price: '85 сом/кг',
    quantity: '200 кг',
    location: 'Джалал-Абад',
    rating: 4.9,
    image: 'https://picsum.photos/seed/tomato/400/300'
  },
  {
    id: 'm4',
    name: 'Яблоки "Превосходные"',
    price: '45 сом/кг',
    quantity: '300 кг',
    location: 'Иссык-Кульская обл.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/apple/400/300'
  },
  {
    id: 'm5',
    name: 'Морковь "Шантанэ"',
    price: '14 сом/кг',
    quantity: '800 кг',
    location: 'Таласская обл.',
    rating: 4.7,
    image: 'https://picsum.photos/seed/carrot/400/300'
  },
  {
    id: 'm6',
    name: 'Капуста белокочанная',
    price: '10 сом/кг',
    quantity: '2000 кг',
    location: 'Нарынская обл.',
    rating: 4.4,
    image: 'https://picsum.photos/seed/cabbage/400/300'
  },
  {
    id: 'm7',
    name: 'Чеснок зимний',
    price: '120 сом/кг',
    quantity: '50 кг',
    location: 'Чуйская обл.',
    rating: 4.8,
    image: 'https://picsum.photos/seed/garlic/400/300'
  },
  {
    id: 'm8',
    name: 'Мед горный',
    price: '450 сом/кг',
    quantity: '100 кг',
    location: 'Нарынская обл.',
    rating: 5.0,
    image: 'https://picsum.photos/seed/honey/400/300'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'm1',
    name: 'Картофель "Алладин"',
    price: '16 сом/кг',
    quantity: '500 кг',
    location: 'Чуйская обл.',
    date: 'Сегодня, 10:45',
    category: 'Овощи, фрукты, зелень',
    badge: 'popular',
    description: 'Отборный картофель, выращенный без химикатов в экологически чистом районе. Крупный, ровный, без повреждений. Отлично подходит для длительного хранения и кулинарии. Урожай этого года.',
    rating: 4.8,
    image: 'https://picsum.photos/seed/potato1/800/600',
    seller: {
      id: 'azamat_123',
      name: 'Азамат Касымов',
      avatar: 'https://picsum.photos/seed/avatar1/150/150',
      rating: 4.9,
      phone: '+996 555 123 456'
    }
  },
  {
    id: 'm2',
    name: 'Лук репчатый',
    price: '12 сом/кг',
    quantity: '1 тонна',
    location: 'Ошская обл.',
    date: 'Вчера, 18:20',
    category: 'Овощи, фрукты, зелень',
    badge: 'new',
    description: 'Крупный, сухой лук. Урожай 2023 года. Самовывоз или доставка по договоренности. Лук хорошо просушен, готов к транспортировке.',
    rating: 4.6,
    image: 'https://picsum.photos/seed/onion/800/600',
    seller: {
      id: 'marat_456',
      name: 'Марат Садыков',
      avatar: 'https://picsum.photos/seed/avatar2/150/150',
      rating: 4.7,
      phone: '+996 700 987 654'
    }
  },
  {
    id: 'm3',
    name: 'Помидоры "Бычье сердце"',
    price: '85 сом/кг',
    quantity: '200 кг',
    location: 'Джалал-Абад',
    date: 'Сегодня, 08:15',
    category: 'Овощи, фрукты, зелень',
    badge: 'top',
    description: 'Сладкие, мясистые домашние помидоры. Выращены в теплице. Идеальны для салатов и сока. Сбор производится в день заказа.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/tomato/800/600',
    seller: {
      id: 'nurbek_789',
      name: 'Нурбек Алиев',
      avatar: 'https://picsum.photos/seed/avatar3/150/150',
      rating: 5.0,
      phone: '+996 777 111 222'
    }
  },
  {
    id: 'm4',
    name: 'Яблоки "Превосходные"',
    price: '40 сом/кг',
    quantity: '3 тонны',
    location: 'Иссык-Куль',
    date: '2 дня назад',
    category: 'Овощи, фрукты, зелень',
    description: 'Сочные яблоки из садов Иссык-Куля. Хрустящие, кисло-сладкие. Сорт отлично переносит транспортировку. Возможен крупный опт.',
    rating: 4.7,
    image: 'https://picsum.photos/seed/apple/800/600',
    seller: {
      id: 'aibek_012',
      name: 'Айбек Осмонов',
      avatar: 'https://picsum.photos/seed/avatar4/150/150',
      rating: 4.8,
      phone: '+996 500 333 444'
    }
  },
  {
    id: 'm5',
    name: 'Пшеница "Твердая"',
    price: '18 сом/кг',
    quantity: '10 тонн',
    location: 'Чуйская обл.',
    date: '3 дня назад',
    category: 'Зерновые и бобовые',
    description: 'Высококачественная пшеница твердых сортов. Идеальна для производства макаронных изделий. Влажность в норме.',
    rating: 4.5,
    image: 'https://picsum.photos/seed/wheat/800/600',
    seller: {
      name: 'Бакыт Токтогулов',
      avatar: 'https://picsum.photos/seed/avatar5/150/150',
      rating: 4.6
    }
  },
  {
    id: 'm6',
    name: 'Ячмень фуражный',
    price: '14 сом/кг',
    quantity: '5 тонн',
    location: 'Таласская обл.',
    date: 'Сегодня, 09:00',
    category: 'Зерновые и бобовые',
    description: 'Ячмень для корма животных. Чистый, без примесей. Урожай прошлого года.',
    rating: 4.3,
    image: 'https://picsum.photos/seed/barley/800/600',
    seller: {
      name: 'Улан Мамытов',
      avatar: 'https://picsum.photos/seed/avatar6/150/150',
      rating: 4.4
    }
  },
  {
    id: 'm100',
    name: 'Мед горный "Ат-Баши"',
    price: '650 сом/кг',
    quantity: '100 кг',
    location: 'Нарын',
    date: 'Сегодня, 11:00',
    category: 'Мед и продукты пчеловодства',
    badge: 'popular',
    description: 'Натуральный белый мед из высокогорья Ат-Баши. Обладает уникальным вкусом и лечебными свойствами. Без добавок и сахара.',
    rating: 5.0,
    image: 'https://picsum.photos/seed/honey/800/600',
    seller: {
      name: 'Эркинбек Жолдошев',
      avatar: 'https://picsum.photos/seed/avatar10/150/150',
      rating: 5.0
    }
  },
  {
    id: 'm101',
    name: 'Кумыс свежий',
    price: '120 сом/л',
    quantity: '50 л',
    location: 'Суусамыр',
    date: 'Сегодня, 06:00',
    category: 'Молочные продукты',
    badge: 'new',
    description: 'Настоящий суусамырский кумыс. Свежий, бодрящий, приготовленный по традиционным рецептам. Доставка каждое утро.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/kumys/800/600',
    seller: {
      name: 'Гульмира Эсенбаева',
      avatar: 'https://picsum.photos/seed/avatar11/150/150',
      rating: 4.9
    }
  },
  {
    id: 'm7',
    name: 'Говядина (четверти)',
    price: '480 сом/кг',
    quantity: '150 кг',
    location: 'Нарынская обл.',
    date: 'Сегодня, 07:30',
    category: 'Мясо и птица',
    description: 'Свежее мясо молодых бычков. Выпас на высокогорных пастбищах Нарына. Натуральный продукт.',
    rating: 5.0,
    image: 'https://picsum.photos/seed/beef/800/600',
    seller: {
      name: 'Эрмек Садыков',
      avatar: 'https://picsum.photos/seed/avatar7/150/150',
      rating: 4.9
    }
  },
  {
    id: 'm8',
    name: 'Молоко домашнее',
    price: '65 сом/л',
    quantity: '1 литр',
    location: 'Чуйская обл.',
    date: 'Сегодня, 06:00',
    category: 'Молочные',
    description: 'Свежее коровье молоко. Жирность 3.8-4.2%. Без добавок.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/milk/800/600',
    seller: {
      name: 'Елена Иванова',
      avatar: 'https://picsum.photos/seed/avatar8/150/150',
      rating: 4.8
    }
  },
  {
    id: 'm9',
    name: 'Виноград "Дамские пальчики"',
    price: '120 сом/кг',
    quantity: '50 кг',
    location: 'Баткенская обл.',
    date: 'Вчера, 14:00',
    category: 'Фрукты',
    description: 'Сладкий, сочный виноград. Прямые поставки из Баткена.',
    rating: 4.8,
    image: 'https://picsum.photos/seed/grapes/800/600',
    seller: {
      name: 'Алишер Каримов',
      avatar: 'https://picsum.photos/seed/avatar9/150/150',
      rating: 4.7
    }
  },
  {
    id: 'm10',
    name: 'Огурцы "Родничок"',
    price: '45 сом/кг',
    quantity: '100 кг',
    location: 'Чуйская обл.',
    date: 'Сегодня, 08:30',
    category: 'Овощи',
    description: 'Хрустящие огурчики, только что с грядки. Идеальны для засолки.',
    rating: 4.7,
    image: 'https://picsum.photos/seed/cucumber/800/600',
    seller: {
      name: 'Татьяна Петрова',
      avatar: 'https://picsum.photos/seed/avatar10/150/150',
      rating: 4.6
    }
  },
  {
    id: 'm11',
    name: 'Яйца домашние',
    price: '120 сом/дес',
    quantity: '10 шт',
    location: 'Чуйская обл.',
    date: 'Сегодня, 07:00',
    category: 'Продукты животноводства',
    description: 'Крупные домашние яйца от кур свободного выгула.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/eggs/800/600',
    seller: {
      name: 'Сергей Волков',
      avatar: 'https://picsum.photos/seed/avatar11/150/150',
      rating: 4.9
    }
  },
  {
    id: 'm12',
    name: 'Мед горный',
    price: '600 сом/кг',
    quantity: '1 кг',
    location: 'Нарын',
    date: 'Неделю назад',
    category: 'Другое',
    description: 'Натуральный горный мед. Сбор 2023 года. Очень ароматный.',
    rating: 5.0,
    image: 'https://picsum.photos/seed/honey/800/600',
    seller: {
      name: 'Данияр Саматов',
      avatar: 'https://picsum.photos/seed/avatar12/150/150',
      rating: 5.0
    }
  }
];

export const SIMILAR_LISTINGS: Listing[] = [
  {
    id: 's1',
    name: 'Картофель "Розара"',
    price: '18 сом/кг',
    quantity: '300 кг',
    location: 'Чуйская обл.',
    rating: 4.5,
    image: 'https://picsum.photos/seed/potato_sim1/400/300'
  },
  {
    id: 's2',
    name: 'Картофель молодой',
    price: '25 сом/кг',
    quantity: '100 кг',
    location: 'Ошская обл.',
    rating: 4.9,
    image: 'https://picsum.photos/seed/potato_sim2/400/300'
  }
];

export const CATEGORIES = [
  'Овощи', 'Фрукты', 'Зерно', 'Молочные продукты', 'Мясо', 'Семена'
];

export const SUBCATEGORIES = [
  'Картофель', 'Лук', 'Морковь', 'Помидоры', 'Капуста'
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Здравствуйте! Я ваш AI помощник EGIN. Чем могу помочь сегодня?',
    sender: 'ai',
    timestamp: '10:00'
  },
  {
    id: '2',
    text: 'У меня есть 2 тонны картофеля',
    sender: 'user',
    timestamp: '10:01'
  },
  {
    id: '3',
    text: 'Средняя цена на картофель в вашем регионе сейчас составляет 16-18 сом за кг. Хотите, я помогу найти покупателей или разместить объявление?',
    sender: 'ai',
    timestamp: '10:01'
  }
];

export const MOCK_USER: UserProfile = {
  id: 'mock_user_1',
  firstName: 'Азамат',
  lastName: 'Касымов',
  fullName: 'Азамат Касымов',
  name: 'Азамат Касымов',
  avatar: 'https://picsum.photos/seed/avatar_user/400/400',
  location: 'Бишкек, Кыргызстан',
  role: 'Фермер'
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    productName: 'Семена пшеницы "Юбилейная"',
    price: '4500 сом',
    date: '12 Марта, 2026',
    status: 'delivered',
    image: 'https://picsum.photos/seed/order1/800/600'
  },
  {
    id: 'o2',
    productName: 'Удобрение NPK 16-16-16',
    price: '12000 сом',
    date: '5 Марта, 2026',
    status: 'delivered',
    image: 'https://picsum.photos/seed/order2/800/600'
  },
  {
    id: 'o3',
    productName: 'Система капельного орошения',
    price: '8500 сом',
    date: '28 Февраля, 2026',
    status: 'delivered',
    image: 'https://picsum.photos/seed/order3/800/600'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Новые субсидии для фермеров в 2024 году',
    content: 'Правительство объявило о запуске новой программы поддержки сельскохозяйственных производителей. В рамках программы фермеры смогут получить льготные кредиты под 3% годовых на закупку техники и семян. Также предусмотрены прямые выплаты за каждый гектар обработанной земли.\n\nЭксперты отмечают, что это решение поможет значительно увеличить объемы производства в текущем сезоне. Для участия в программе необходимо подать заявку через портал государственных услуг до конца месяца.',
    date: 'Сегодня, 09:00',
    image: 'https://picsum.photos/seed/news1/800/600',
    author: 'Алексей Иванов',
    authorId: 'alexey_777',
    reactions: [
      { type: '👍', count: 124 },
      { type: '🔥', count: 56 },
      { type: '👏', count: 32 }
    ],
    comments: [
      { id: 'c1', user: 'Иван Петров', text: 'Отличная новость! Давно ждали такой поддержки.', date: '2 часа назад' },
      { id: 'c2', user: 'Мария Сидорова', text: 'А какие документы нужны для подачи заявки?', date: '1 час назад' }
    ]
  },
  {
    id: 'n2',
    title: 'Экспорт картофеля вырос на 15%',
    content: 'По данным таможенной службы, экспорт картофеля из региона в первом квартале 2024 года вырос на 15% по сравнению с аналогичным периодом прошлого года. Основными покупателями стали соседние страны.\n\nРост экспорта связан с улучшением качества продукции и внедрением новых технологий хранения. Фермеры отмечают, что выход на международные рынки позволяет им получать более высокую прибыль и инвестировать в развитие своих хозяйств.',
    date: 'Вчера, 14:20',
    image: 'https://picsum.photos/seed/news2/800/600',
    author: 'Елена Смирнова',
    authorId: 'elena_888',
    reactions: [
      { type: '📈', count: 89 },
      { type: '🚀', count: 45 }
    ],
    comments: [
      { id: 'c3', user: 'Сергей Волков', text: 'Это хороший показатель для нашей экономики.', date: 'Вчера, 18:00' }
    ]
  },
  {
    id: 'n3',
    title: 'Прогноз погоды на посевной сезон',
    content: 'Метеорологи представили долгосрочный прогноз на весенний период. Ожидается, что весна будет ранней и теплой, что позволит начать посевные работы на 10-14 дней раньше обычного.\n\nОднако эксперты предупреждают о возможных кратковременных заморозках в середине мая. Фермерам рекомендуется заранее подготовить системы защиты растений и следить за ежедневными обновлениями прогноза.',
    date: '2 дня назад',
    image: 'https://picsum.photos/seed/news3/800/600',
    author: 'Дмитрий Соколов',
    authorId: 'dmitry_999',
    reactions: [
      { type: '☀️', count: 210 },
      { type: '🌱', count: 145 }
    ],
    comments: []
  }
];

export const MOCK_COMMUNITIES: CommunityCategory[] = [
  {
    id: 'cat1',
    name: 'Растениеводство',
    icon: Sprout,
    chats: [
      { id: 'ch1', name: 'Выращивание картофеля', lastMessage: 'Какой сорт лучше для юга?', members: 1250, image: 'https://picsum.photos/seed/comm1/150/150' },
      { id: 'ch2', name: 'Зерновые культуры', lastMessage: 'Обсуждаем сроки посева пшеницы', members: 850, image: 'https://picsum.photos/seed/comm2/150/150' },
      { id: 'ch3', name: 'Тепличное хозяйство', lastMessage: 'Как бороться с фитофторой?', members: 2100, image: 'https://picsum.photos/seed/comm3/150/150' }
    ]
  },
  {
    id: 'cat2',
    name: 'Животноводство',
    icon: Beef,
    chats: [
      { id: 'ch4', name: 'Крупный рогатый скот', lastMessage: 'Рацион для молочных коров', members: 1500, image: 'https://picsum.photos/seed/comm4/150/150' },
      { id: 'ch5', name: 'Птицеводство', lastMessage: 'Лучшие породы кур-несушек', members: 920, image: 'https://picsum.photos/seed/comm5/150/150' }
    ]
  },
  {
    id: 'cat3',
    name: 'Техника и Инновации',
    icon: Truck,
    chats: [
      { id: 'ch6', name: 'Ремонт тракторов', lastMessage: 'Где найти запчасти на МТЗ?', members: 3200, image: 'https://picsum.photos/seed/comm6/150/150' },
      { id: 'ch7', name: 'Дроны в сельском хозяйстве', lastMessage: 'Опыт использования DJI Agras', members: 450, image: 'https://picsum.photos/seed/comm7/150/150' }
    ]
  }
];

export const CATEGORIES_LIST = [
  { id: 'fruit', name: 'Фрукты', icon: Apple, color: 'bg-red-50 text-red-500' },
  { id: 'veg', name: 'Овощи', icon: ShoppingBag, color: 'bg-orange-50 text-orange-500' },
  { id: 'dairy', name: 'Молочные', icon: Milk, color: 'bg-blue-50 text-blue-600' },
  { id: 'meat', name: 'Мясо', icon: Beef, color: 'bg-red-50 text-red-600' },
  { id: 'seeds', name: 'Семена', icon: Sprout, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'tech', name: 'Техника', icon: Truck, color: 'bg-slate-50 text-slate-600' },
];

