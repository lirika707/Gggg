/**
 * offline.js
 * Слой для работы приложения в условиях плохого интернета.
 * Реализует кэширование данных и очередь отложенных действий.
 */

const QUEUE_KEY = 'egin_pending_actions';

/**
 * Сохранить данные в локальный кэш
 * @param {string} key - Ключ (например, 'weather' или 'products')
 * @param {any} data - Данные для сохранения
 */
export function saveToCache(key, data) {
  try {
    const cacheObject = {
      payload: data,
      savedAt: Date.now()
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheObject));
  } catch (e) {
    console.error("[Offline] Save error:", e);
  }
}

/**
 * Загрузить данные из локального кэша
 * @param {string} key - Ключ данных
 * @returns {any|null} - Данные или null, если кэш пуст
 */
export function loadFromCache(key) {
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;
    return JSON.parse(item).payload;
  } catch (e) {
    console.error("[Offline] Load error:", e);
    return null;
  }
}

/**
 * Добавить действие в очередь для последующей синхронизации
 * @param {object} action - Объект действия { type, path, data }
 */
export function addToQueue(action) {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...action,
      timestamp: Date.now(),
      attemptCount: 0
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.warn("[Offline] Действие добавлено в очередь (Offline mode)", action);
  } catch (e) {
    console.error("[Offline] Queue error:", e);
  }
}

/**
 * Обработать накопившуюся очередь действий
 * @param {Function} handler - Асинхронная функция для выполнения действия (должна принимать action)
 */
export async function processQueue(handler) {
  if (!navigator.onLine) return;

  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  if (queue.length === 0) return;

  console.log(`[Offline] Синхронизация: ${queue.length} действий в очереди...`);
  
  const remaining = [];

  for (const action of queue) {
    try {
      await handler(action);
      console.log(`[Offline] Успешно выполнено:`, action);
    } catch (e) {
      console.error(`[Offline] Ошибка при выполнении действия:`, e);
      action.attemptCount++;
      // Если попыток слишком много, возможно, действие некорректно (удаляем или логируем)
      if (action.attemptCount < 5) {
        remaining.push(action);
      }
    }
  }

  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

/**
 * Вспомогательная функция: Сначала Кэш, потом Сеть
 * @param {string} key - Ключ данных
 * @param {Function} networkRequest - Функция-запрос к Firebase
 * @param {Function} onData - Callback для обновления UI (вызывается 1 или 2 раза)
 */
export async function smartFetch(key, networkRequest, onData) {
  // 1. Сразу отдаем кэш (если есть)
  const cached = loadFromCache(key);
  if (cached) onData(cached);

  // 2. Делаем запрос в сеть, если онлайн
  if (navigator.onLine) {
    try {
      const freshData = await networkRequest();
      saveToCache(key, freshData);
      onData(freshData); // Обновляем UI свежими данными
      return freshData;
    } catch (e) {
      console.error("[Offline] SmartFetch network failed:", e);
    }
  }
  return cached;
}
