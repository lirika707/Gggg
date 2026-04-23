import { useEffect, useState } from 'react';
import {
    addDoc,
    auth,
    collection,
    db,
    deleteDoc,
    doc,
    FirebaseUser,
    getDoc,
    getDocs,
    handleFirestoreError,
    increment,
    limit,
    onAuthStateChanged,
    onSnapshot,
    OperationType,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from '../firebase';
import { Post } from '../types';


export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'posts'), where('createdAt', '!=', null));
    if (userId) {
      q = query(collection(db, 'posts'), where('userId', '==', userId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      // Sort manually because of firestore index requirements for multi-field queries
      newPosts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(newPosts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { posts, loading };
};

export const useFollows = (currentUserId?: string, targetUserId?: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
      setIsFollowing(false);
      setLoading(false);
      return;
    }

    const followId = `${currentUserId}_${targetUserId}`;
    const unsubscribe = onSnapshot(doc(db, 'follows', followId), (doc) => {
      setIsFollowing(doc.exists());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, targetUserId]);

  const toggleFollow = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    const followId = `${currentUserId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);
    
    try {
      if (isFollowing) {
        await deleteDoc(followRef);
        await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(-1) });
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(-1) });
      } else {
        await setDoc(followRef, {
          followerId: currentUserId,
          followingId: targetUserId,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'users', currentUserId), { followingCount: increment(1) });
        await updateDoc(doc(db, 'users', targetUserId), { followersCount: increment(1) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'follows');
    }
  };

  return { isFollowing, toggleFollow, loading };
};

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = collection(db, 'users', userId, 'favorites');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFavorites(snapshot.docs.map(doc => doc.id));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const toggleFavorite = async (productId: string) => {
    if (!userId) return;
    
    const favRef = doc(db, 'users', userId, 'favorites', productId);
    
    if (favorites.includes(productId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, {
        productId,
        createdAt: serverTimestamp()
      });
    }
  };

  return { favorites, toggleFavorite, loading };
};

export const useWeather = () => {
  const [weather, setWeather] = useState<{ temp: string, desc: string, city: string } | null>(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://wttr.in/${latitude},${longitude}?format=j1`);
          const data = await res.json();
          setWeather({
            temp: data.current_condition[0].temp_C,
            desc: data.current_condition[0].lang_ru[0].value,
            city: data.nearest_area[0].areaName[0].value
          });
        } catch (e) {
          console.error("Weather fetch error", e);
        }
      });
    }
  }, []);
  return weather;
};

export const useParsedCrops = (userId?: string) => {
  const [crops, setCrops] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'users', userId, 'ai_messages'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data().text || '');
      const foundCrops = new Set<string>();
      messages.forEach(msg => {
        if (msg.includes('культура')) {
           const match = msg.match(/(?:культура|растить)\s+(\w+)/i);
           if (match) foundCrops.add(match[1]);
        }
      });
      setCrops(Array.from(foundCrops));
    });
    return () => unsubscribe();
  }, [userId]);
  return crops;
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check role in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const role = (user.email === 'nterra558@gmail.com' || user.email === 'admin@admin.app' || data.role === 'admin') ? 'admin' : data.role;
            setUserRole(role);
            
            // Auto-upgrade nterra558@gmail.com to admin if not already
            if (role === 'admin' && data.role !== 'admin') {
              await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
            }
            
            // Sync Google data if needed (e.g. if name/photo changed)
            if (user.providerData[0]?.providerId === 'google.com') {
              const updates: any = { updatedAt: serverTimestamp() };
              let hasUpdates = false;
              
              if (!data.fullName && user.displayName) {
                updates.fullName = user.displayName;
                const names = user.displayName.split(' ');
                updates.firstName = names[0] || '';
                updates.lastName = names.slice(1).join(' ') || '';
                hasUpdates = true;
              }
              if (!data.avatar && user.photoURL) {
                updates.avatar = user.photoURL;
                hasUpdates = true;
              }
              
              if (hasUpdates) {
                await updateDoc(doc(db, 'users', user.uid), updates);
              }
            }
          } else {
            // Create user doc if not exists (e.g. first time Google login)
            const names = (user.displayName || '').split(' ');
            const firstName = names[0] || '';
            const lastName = names.slice(1).join(' ') || '';
            const defaultLogin = user.email?.split('@')[0] || 'user';
            
            const newUser = {
              uid: user.uid,
              email: user.email,
              login: defaultLogin,
              normalizedLogin: defaultLogin.toLowerCase().replace(/[^a-z0-9_.]/g, ''),
              authEmail: user.email,
              firstName,
              lastName,
              fullName: user.displayName || 'Пользователь',
              photoURL: user.photoURL || 'https://picsum.photos/seed/user/150/150',
              avatar: user.photoURL || 'https://picsum.photos/seed/user/150/150',
              role: (user.email === 'nterra558@gmail.com' || user.email === 'admin@admin.app') ? 'admin' : 'user',
              location: 'Бишкек, Кыргызстан',
              bio: '',
              phone: user.phoneNumber || '',
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              listingsCount: 0,
              soldCount: 0,
              rating: 0,
              verified: false,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
            setUserRole(newUser.role as 'admin' | 'user');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { currentUser, userRole, loading };
};

export const seedDatabase = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Пожалуйста, войдите в систему, чтобы заполнить базу данных.");
    return;
  }

  const categories = ['Овощи', 'Фрукты', 'Зерновые', 'Техника', 'Удобрения', 'Животные', 'Молочные продукты', 'Мясо', 'Мед', 'Саженцы'];
  const locations = ['Чуйская обл.', 'Ошская обл.', 'Джалал-Абад', 'Иссык-Куль', 'Нарын', 'Талас', 'Баткен', 'Бишкек'];
  
  console.log("Starting seeding...");
  
  // Seed 150 products
  for (let i = 0; i < 150; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const price = Math.floor(Math.random() * 1000) + 10;
    
    const product = {
      name: `${category} ${['Премиум', 'Отборный', 'Свежий', 'Оптом', 'Эко'][Math.floor(Math.random() * 5)]} #${i + 1}`,
      price: `${price} сом/кг`,
      quantity: `${Math.floor(Math.random() * 1000) + 50} кг`,
      location: location,
      category: category,
      description: `Высококачественный продукт из региона ${location}. Свежий урожай, отличные вкусовые качества. Соответствует всем стандартам качества.`,
      rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
      image: `https://picsum.photos/seed/prod${Date.now() + i}/800/600`,
      sellerId: user.uid,
      seller: {
        name: user.displayName || 'Фермер',
        avatar: user.photoURL || 'https://picsum.photos/seed/farmer/150/150',
        rating: 4.9
      },
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (e) {
      console.error("Error seeding product:", e);
    }
  }
  
  const serviceCategories = ['Тракторы', 'Уборка', 'Посев', 'Консультации', 'Логистика', 'Аренда склада', 'Ветеринар', 'Агроном'];
  for (let i = 0; i < 100; i++) {
    const category = serviceCategories[Math.floor(Math.random() * serviceCategories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const price = Math.floor(Math.random() * 5000) + 500;
    
    const service = {
      name: `${category} сервис ${['Профи', 'Эксперт', 'Быстро', 'Надежно'][Math.floor(Math.random() * 4)]} #${i + 1}`,
      price: `${price} сом/час`,
      location: location,
      category: category,
      description: `Профессиональные услуги по направлению ${category}. Опытные специалисты, современное оборудование. Гарантия качества и соблюдение сроков.`,
      rating: parseFloat((Math.random() * (5 - 4) + 4).toFixed(1)),
      image: `https://picsum.photos/seed/serv${Date.now() + i}/800/600`,
      providerId: user.uid,
      providerName: user.displayName || 'АгроСервис',
      providerAvatar: user.photoURL || 'https://picsum.photos/seed/provider/150/150',
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'services'), service);
    } catch (e) {
      console.error("Error seeding service:", e);
    }
  }

  // Seed transactions
  const transCategories = ['Продажа товара', 'Покупка семян', 'Аренда техники', 'Услуги агронома', 'Логистика', 'Удобрения'];
  for (let i = 0; i < 20; i++) {
    const type = Math.random() > 0.4 ? 'income' : 'expense';
    const amount = Math.floor(Math.random() * 15000) + 500;
    const category = transCategories[Math.floor(Math.random() * transCategories.length)];
    
    const transaction = {
      userId: user.uid,
      amount,
      type,
      category,
      description: `${category} - транзакция #${i + 1}`,
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'transactions'), transaction);
    } catch (e) {
      console.error("Error seeding transaction:", e);
    }
  }

  // Seed posts
  const postContents = [
    'Сегодня отличная погода для посева! Начинаем работу.',
    'Кто знает, где лучше купить семена картофеля?',
    'Наш урожай в этом году просто отличный!',
    'Новые технологии в сельском хозяйстве - это будущее.',
    'Ищем партнеров для экспорта яблок.'
  ];
  
  for (let i = 0; i < 30; i++) {
    const content = postContents[Math.floor(Math.random() * postContents.length)];
    const post = {
      userId: user.uid,
      userName: user.displayName || 'Фермер',
      userAvatar: user.photoURL || 'https://picsum.photos/seed/user/150/150',
      content: `${content} #${i + 1}`,
      image: Math.random() > 0.5 ? `https://picsum.photos/seed/post${Date.now() + i}/800/600` : null,
      createdAt: serverTimestamp()
    };
    
    try {
      await addDoc(collection(db, 'posts'), post);
    } catch (e) {
      console.error("Error seeding post:", e);
    }
  }

  alert("База данных успешно заполнена!");
};

export const clearDatabase = async () => {
  if (!auth.currentUser) return;
  if (!window.confirm("Вы уверены, что хотите удалить ВСЕ товары и услуги? Это действие необратимо.")) return;

  try {
    const pSnap = await getDocs(collection(db, 'products'));
    const sSnap = await getDocs(collection(db, 'services'));
    
    const deletePromises = [
      ...pSnap.docs.map(d => deleteDoc(doc(db, 'products', d.id))),
      ...sSnap.docs.map(d => deleteDoc(doc(db, 'services', d.id)))
    ];
    
    await Promise.all(deletePromises);
    alert("База данных очищена!");
  } catch (e) {
    console.error("Error clearing database:", e);
    alert("Ошибка при очистке базы данных.");
  }
};

