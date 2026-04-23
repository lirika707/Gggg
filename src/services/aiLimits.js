import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';

/**
 * Проверка и обновление лимита использования ИИ (3 запроса в день)
 * @param {string} userId - ID текущего пользователя
 * @returns {Promise<boolean>} - true если доступ разрешен, иначе выбрасывает ошибку
 */
export async function checkLimit(userId) {
  if (!userId) throw new Error("Пользователь не авторизован");

  const limitRef = doc(db, 'ai_limits', userId);
  const now = new Date();
  // Формат даты ГГГГ-ММ-ДД для сравнения дней
  const todayStr = now.toISOString().split('T')[0];

  try {
    const docSnap = await getDoc(limitRef);

    if (!docSnap.exists()) {
      // Первый запрос пользователя вообще
      await setDoc(limitRef, {
        userId,
        requestsToday: 1,
        lastRequestDate: todayStr
      });
      return true;
    }

    const data = docSnap.data();

    if (data.lastRequestDate !== todayStr) {
      // Наступил новый день - сбрасываем счетчик
      await updateDoc(limitRef, {
        requestsToday: 1,
        lastRequestDate: todayStr
      });
      return true;
    } else {
      // Тот же день - проверяем лимит
      if (data.requestsToday >= 3) {
        throw new Error("Дневной лимит (3 запроса) исчерпан. Попробуйте завтра!");
      }

      // Лимит не превышен - инкрементируем
      await updateDoc(limitRef, {
        requestsToday: increment(1)
      });
      return true;
    }
  } catch (error) {
    console.error("[AI Limit] Error:", error.message);
    throw error;
  }
}
