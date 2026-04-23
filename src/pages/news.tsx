import {
    Activity,
    ArrowRight,
    BookOpen,
    Heart,
    Image as ImageIcon,
    MessageCircle,
    Share2,
    User,
    X
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { MOCK_NEWS } from "../constants/mocks";
import {
    addDoc,
    collection,
    db,
    doc,
    handleFirestoreError,
    increment,
    OperationType,
    serverTimestamp,
    updateDoc
} from '../firebase';
import { useAuth, useFollows, usePosts } from "../hooks";
import { NewsItem, Post } from "../types";
import { cn } from "../utils";

export const NewsSection = ({ onNewsClick }: { onNewsClick: (news: NewsItem) => void }) => (
  <section className="mt-8 px-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
        Новости <span className="text-emerald-600 dark:text-emerald-400">Агро</span>
      </h3>
      <button className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Все</button>
    </div>
    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
      {MOCK_NEWS.map((news) => (
        <div 
          key={news.id} 
          onClick={() => onNewsClick(news)}
          className="min-w-[240px] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer active:scale-95 transition-transform"
        >
          <img src={news.image} alt={news.title} className="w-full h-24 object-cover" referrerPolicy="no-referrer" />
          <div className="p-4">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">{news.date}</span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">{news.title}</h4>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const BlogSection = ({ onPostClick, onProfileClick }: { onPostClick: (post: any) => void; onProfileClick?: (userId: string) => void }) => (
  <section className="mt-8 px-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
        Блог <span className="text-emerald-600 dark:text-emerald-400">экспертов</span>
      </h3>
    </div>
    <div className="space-y-4">
      {[
        { 
          id: 'b1', 
          title: 'Как повысить урожайность зерновых', 
          author: 'Азамат Исаев', 
          authorId: 'author_b1',
          views: '1.2k', 
          icon: BookOpen, 
          image: 'https://picsum.photos/seed/blog1/400/300',
          content: '...',
          date: '3 дня назад',
          reactions: [{ type: '🌱', count: 45 }, { type: '👍', count: 120 }],
          comments: []
        },
        { 
          id: 'b2', 
          title: 'Секреты хранения овощей зимой', 
          author: 'Мария Петрова', 
          authorId: 'author_b2',
          views: '850', 
          icon: BookOpen, 
          image: 'https://picsum.photos/seed/blog2/400/300',
          content: '...',
          date: '5 дней назад',
          reactions: [{ type: '❄️', count: 32 }, { type: '📦', count: 67 }],
          comments: []
        },
      ].map((post, i) => (
        <div 
          key={i} 
          onClick={() => onPostClick(post)}
          className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl overflow-hidden flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{post.title}</h4>
            <div className="flex items-center gap-2 mt-1.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onProfileClick) onProfileClick(post.authorId || 'system');
                }}
                className="text-xs text-slate-400 dark:text-slate-500 font-medium hover:text-emerald-500 transition-colors"
              >
                {post.author}
              </button>
              <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{post.views} просмотров</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const FeedPost: React.FC<{ post: Post; onProfileClick: (userId: string) => void }> = ({ post, onProfileClick }) => {
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useFollows(currentUser?.uid, post.userId);
  const isCurrentUser = currentUser?.uid === post.userId;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onProfileClick(post.userId)}>
            <img src={post.userAvatar} className="w-10 h-10 rounded-2xl object-cover" />
          </button>
          <div>
            <button onClick={() => onProfileClick(post.userId)}>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">{post.userName}</h4>
            </button>
            <p className="text-[10px] text-slate-400 font-bold">
              {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'Только что'}
            </p>
          </div>
        </div>
        {!isCurrentUser && currentUser && (
          <button 
            onClick={toggleFollow}
            className={cn(
              "px-3 py-1 text-[10px] font-bold rounded-full transition-all active:scale-95",
              isFollowing 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500" 
                : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            )}
          >
            {isFollowing ? 'Подписан' : 'Подписаться'}
          </button>
        )}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      {post.image && (
        <img src={post.image} className="mt-4 w-full h-64 object-cover rounded-2xl shadow-sm" />
      )}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50">
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors">
          <Heart size={18} />
          <span className="text-xs font-bold">0</span>
        </button>
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors">
          <MessageCircle size={18} />
          <span className="text-xs font-bold">0</span>
        </button>
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors ml-auto">
          <Share2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export const FeedPage = ({ onProfileClick }: { onProfileClick: (userId: string) => void }) => {
  const { posts, loading } = usePosts();
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleCreatePost = async () => {
    if (!currentUser || !newPostText.trim()) return;
    setIsSubmitting(true);
    try {
      const postData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Пользователь',
        userAvatar: currentUser.photoURL || 'https://picsum.photos/seed/user/150/150',
        content: newPostText,
        image: newPostImage || null,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'posts'), postData);
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

  return (
    <div className="pb-24 px-6 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Лента</h2>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
          <Activity size={20} />
        </div>
      </div>

      {currentUser && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
          <textarea 
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder="Что нового?"
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white resize-none h-24"
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
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const url = window.prompt('Введите URL изображения:');
                  if (url) setNewPostImage(url);
                }}
                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <ImageIcon size={20} />
              </button>
            </div>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <FeedPost key={post.id} post={post} onProfileClick={onProfileClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export const NewsDetailsPage = ({ news, onProfileClick }: { news: NewsItem; onProfileClick?: (userId: string) => void }) => {
  const [comment, setComment] = useState('');
  const [reactions, setReactions] = useState(news.reactions);

  const handleAddReaction = (type: string) => {
    setReactions(prev => prev.map(r => r.type === type ? { ...r, count: r.count + 1 } : r));
  };

  return (
    <div className="pb-24 bg-white dark:bg-slate-950 min-h-screen">
      <img src={news.image} alt={news.title} className="w-full h-64 object-cover" referrerPolicy="no-referrer" />
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {news.date}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button 
              onClick={() => onProfileClick && onProfileClick(news.authorId || 'system')}
              className="text-xs text-slate-400 dark:text-slate-500 font-medium hover:text-brand-600 transition-colors"
            >
              {news.author}
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-6">{news.title}</h2>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {(news.content || '').split('\n\n').map((para, i) => (
              <p key={i} className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{para}</p>
            ))}
          </div>

          {/* Reactions */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Реакции</h4>
            <div className="flex flex-wrap gap-2">
              {reactions.map((r, i) => (
                <button 
                  key={i}
                  onClick={() => handleAddReaction(r.type)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-2xl flex items-center gap-2 transition-colors border border-slate-100 dark:border-slate-700"
                >
                  <span className="text-lg">{r.type}</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{r.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Комментарии ({news.comments.length})</h4>
            
            <div className="space-y-6 mb-8">
              {news.comments.map((c) => (
                <div key={c.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => onProfileClick && onProfileClick(c.userId || 'system')}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-brand-600 transition-colors"
                      >
                        {c.user}
                      </button>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{c.date}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Оставьте ваш комментарий..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-4 px-5 text-sm focus:ring-2 focus:ring-brand-500/20 resize-none text-slate-900 dark:text-white"
                rows={3}
              />
              <button 
                disabled={!comment.trim()}
                className="absolute right-3 bottom-3 p-2 bg-brand-600 text-white rounded-2xl disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

