

export interface Listing {
  id: string;
  name: string;
  price: string;
  quantity: string;
  location: string;
  rating: number;
  image: string;
}

export interface Product extends Listing {
  description: string;
  date: string;
  category: string;
  badge?: 'new' | 'popular' | 'top';
  sellerId?: string;
  seller: {
    name: string;
    avatar: string;
    rating: number;
    phone?: string;
  };
  createdAt?: any;
}

export interface Service {
  id: string;
  name: string;
  price: string;
  location: string;
  category: string;
  description: string;
  rating: number;
  image: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  createdAt?: any;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string;
  suggestions?: {
    label: string;
    type: 'link' | 'tip' | 'action';
    value: string;
  }[];
}

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  name?: string; // Keep for compatibility
  username?: string;
  avatar: string;
  location: string;
  role: string;
  email?: string;
  phone?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  listingsCount?: number;
  postsCount?: number;
  soldCount?: number;
  rating?: number;
  verified?: boolean;
  quickRegistration?: boolean;
  registrationLevel?: 'quick' | 'full' | 'social';
  provider?: string;
  joinedDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  createdAt: any;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: any;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  createdAt: any;
}

export interface Order {
  id: string;
  productName: string;
  price: string;
  date: string;
  status: 'delivered' | 'processing' | 'cancelled';
  image: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  author: string;
  reactions: { type: string; count: number }[];
  comments: { id: string; user: string; text: string; date: string }[];
}

export interface CommunityChat {
  id: string;
  name: string;
  lastMessage: string;
  members: number;
  image: string;
}

export interface CommunityCategory {
  id: string;
  name: string;
  icon: any;
  chats: CommunityChat[];
}

export type Language = 'ru' | 'kg';

export type View = 'home' | 'market' | 'details' | 'sell' | 'ai' | 'settings' | 'theme_settings' | 'lang_settings' | 'communities' | 'news_details' | 'community_chats' | 'chat_room' | 'search' | 'admin' | 'services' | 'login' | 'feed' | 'profile' | 'weather_details' | 'ai_search';

export type Theme = 'light' | 'dark' | 'system';

