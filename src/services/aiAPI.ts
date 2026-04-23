/**
 * Пример клиента для отправки фото растения на Firebase Cloud Function.
 * Этот сервис инкапсулирует вызов API, чтобы фронтенд был "тонким".
 */

export interface PlantDiagnosisResult {
    disease: string;
    description: string;
    treatment: string;
}

export const analyzePlantImage = async (base64Image: string): Promise<PlantDiagnosisResult> => {
    // Укажите здесь URL вашей задеплоенной функции Firebase
    // Например: https://analyzeplant-XXXXXXXXX-as.a.run.app
    // Для локального тестирования (через firebase emulators): 'http://127.0.0.1:5001/ВАШ_ПРОЕКТ/asia-southeast1/analyzePlant'
    const BACKEND_URL = 'https://analyzeplant-xxxxxxxx-as.a.run.app';

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // Очищаем base64 от префикса 'data:image/jpeg;base64,', если он есть
                imageBase64: base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data: PlantDiagnosisResult = await response.json();
        return data;
        
    } catch (error) {
        console.error("Ошибка при запросе к бэкенду:", error);
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
