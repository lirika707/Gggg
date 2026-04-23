const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");

// Инициализация Gemini с использованием переменной окружения
// В Firebase перед деплоем нужно задать переменную: 
// firebase functions:secrets:set GEMINI_API_KEY
// или использовать process.env для локального тестирования
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY 
});

exports.analyzePlant = onRequest({ 
    cors: true,
    secrets: ["GEMINI_API_KEY"], // Firebase автоматически загрузит этот секрет в process.env
    region: "asia-southeast1" 
}, async (req, res) => {
    // 1. Противодействие нежелательным методам
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
        return;
    }

    try {
        // 2. Получение данных из тела запроса
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            res.status(400).json({ error: "Missing 'imageBase64' in request body" });
            return;
        }

        // 3. Формирование системного промпта
        const prompt = `Ты профессиональный агроном из Центральной Азии (Кыргызстан). 
Диагностируй состояние или болезнь растения по этому фото. 
Ответь строго в формате JSON без markdown разметки:
{
  "disease": "Название болезни/вредителя или 'Здорово'",
  "description": "Краткое описание проблемы и симптомов",
  "treatment": "Доступное и практичное лечение для фермеров в Центральной Азии (аптечные/народные средства или доступные препараты)"
}`;

        // 4. Отправка запроса в Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                data: imageBase64,
                                mimeType: "image/jpeg"
                            }
                        }
                    ]
                }
            ]
        });

        // 5. Парсинг ответа
        const text = response.text || "{}";
        // Очищаем ответ от markdown, если модель его добавила (например ```json)
        const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        
        let result;
        try {
            result = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("JSON Parse Error on Gemini response:", cleanedText);
            // Fallback объект
            result = {
                disease: "Ошибка анализа",
                description: text,
                treatment: "Обратитесь к местному ветеринару или агроному."
            };
        }

        // 6. Успешный ответ
        res.status(200).json(result);

    } catch (error) {
        console.error("Plant Analysis Endpoint Error:", error);
        
        // 7. Обработка ошибки
        res.status(500).json({ 
            error: "Внутренняя ошибка сервера при анализе изображения",
            details: error.message 
        });
    }
});

exports.chatAssistant = onRequest({ 
    cors: true,
    secrets: ["GEMINI_API_KEY"],
    region: "asia-southeast1" 
}, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
        return;
    }

    try {
        const { messages, systemInstruction, image } = req.body;

        if (!messages || !Array.isArray(messages)) {
            res.status(400).json({ error: "Missing or invalid 'messages' in request body" });
            return;
        }

        const model = ai.getGenerativeModel({
            model: "gemini-2.0-flash", // Use a stable and fast model
            systemInstruction: systemInstruction || "Вы — опытный агроном."
        });

        const lastMessage = messages[messages.length - 1];
        let promptParts = [lastMessage.parts[0].text];

        if (image) {
            const base64Data = image.split(',')[1];
            const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
            promptParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        // We use a simpler chat interaction for Cloud Functions to avoid complex streaming state here
        // If they need full history, we can pass it, but for a simple fix, let's just use the current request
        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ text });

    } catch (error) {
        console.error("Chat Assistant Endpoint Error:", error);
        res.status(500).json({ 
            error: "Ошибка при генерации ответа ИИ",
            details: error.message 
        });
    }
});
