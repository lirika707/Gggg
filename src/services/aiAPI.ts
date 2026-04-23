/**
 * Пример клиента для отправки фото растения на Firebase Cloud Function.
 * Этот сервис инкапсулирует вызов API, чтобы фронтенд был "тонким".
 */

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface PlantDiagnosisResult {
    disease: string;
    description: string;
    treatment: string;
}

export const analyzePlantImage = async (base64Image: string): Promise<PlantDiagnosisResult> => {
    try {
        const prompt = `Проанализируй фото растения. Если на нем есть болезнь, определи её. 
        Верни ответ в формате JSON со следующими полями:
        - disease: Название болезни (или "Здоровое растение")
        - description: Краткое описание проблемы
        - treatment: Рекомендации по лечению и уходу
        Ответь ТОЛЬКО чистым JSON.`;

        // Extract base64 safely
        const base64Data = base64Image.includes('base64,') 
            ? base64Image.split('base64,')[1] 
            : base64Image;

        const imagePart = {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
            },
        };

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { role: 'user', parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text || "{}";
        const data: PlantDiagnosisResult = JSON.parse(text);
        return data;
        
    } catch (error) {
        console.error("Ошибка при анализе растения:", error);
        throw error;
    }
};

export const chatWithAI = async (messages: any[], systemInstruction: string, image?: string | null): Promise<string> => {
    try {
        // If it's a full history (array of {role, parts}), we use it directly
        // but we might need to inject the image into the last user message
        let contents: any[] = [];

        if (messages.length > 0 && messages[0].parts) {
            // It's a full history format: [{role: 'user', parts: [...]}, ...]
            contents = [...messages];
            
            if (image) {
                const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
                const lastIdx = contents.length - 1;
                // Add image to the last part if it was a user message
                if (contents[lastIdx].role === 'user') {
                    contents[lastIdx].parts = [
                        { inlineData: { mimeType: "image/jpeg", data: base64Data } },
                        ...contents[lastIdx].parts
                    ];
                }
            }
        } else {
            // It's a simple format or just one message
            const parts: any[] = [];
            
            if (image) {
                const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;
                parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data
                    }
                });
            }

            const lastMessage = messages[messages.length - 1];
            const textContent = lastMessage.content || lastMessage.text || (typeof lastMessage === 'string' ? lastMessage : '');
            
            if (textContent) {
                parts.push({ text: textContent });
            } else {
                // If somehow text is empty but parts has image, it's fine,
                // but if both are empty, we need a fallback text.
                if (parts.length === 0) {
                    parts.push({ text: "Привет" });
                }
            }

            contents = [{ role: 'user', parts }];
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents,
            config: {
                systemInstruction: systemInstruction
            }
        });

        return response.text || "Извините, я не смог сгенерировать ответ.";
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw error;
    }
};

/**
 * Утилита для конвертации файла изображения (из <input type="file">) в base64.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};
