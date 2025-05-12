
// Предоставляем случайные изображения, если загрузка не удалась
const FALLBACK_IMAGES = [
  "https://i.ibb.co/9hLBbbc/phone-default.jpg",
  "https://i.ibb.co/CWjYGsR/tablet-default.jpg",
  "https://i.ibb.co/h84WDgZ/laptop-default.jpg",
  "https://i.ibb.co/5xpPP1N/accessory-default.jpg"
];

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", "6e681c9c15fe63d6b40db8afc9230a41");
  
  try {
    // Попытка загрузки через ImgBB API
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
      // Добавляем заголовки CORS
      mode: "cors",
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      console.warn("ImgBB upload failed, using fallback image");
      // Если загрузка не удалась, возвращаем случайное изображение из набора
      const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
      return FALLBACK_IMAGES[randomIndex];
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    // В случае ошибки также возвращаем случайное изображение
    const randomIndex = Math.floor(Math.random() * FALLBACK_IMAGES.length);
    return FALLBACK_IMAGES[randomIndex];
  }
};
