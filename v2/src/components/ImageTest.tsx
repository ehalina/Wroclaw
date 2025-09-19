import React, { useState } from 'react';

interface ImageTestProps {
  src: string;
  alt: string;
}

export const ImageTest: React.FC<ImageTestProps> = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-white mb-2">Тест изображения: {alt}</h3>
      <p className="text-gray-300 mb-2">Путь: {src}</p>
      
      {error ? (
        <div className="text-red-400">❌ Ошибка загрузки</div>
      ) : loaded ? (
        <div className="text-green-400">✅ Загружено успешно</div>
      ) : (
        <div className="text-yellow-400">⏳ Загрузка...</div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className="w-32 h-32 object-cover mt-2"
      />
    </div>
  );
};
