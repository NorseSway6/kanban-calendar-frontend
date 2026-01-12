// src/components/ImportCalendar.tsx
import React, { useState, useRef } from 'react';

interface ImportCalendarProps {
  apiBaseUrl: string;
  onImportSuccess?: (importedCount: number) => void;
  onImportError?: (error: string) => void;
}

const ImportCalendar: React.FC<ImportCalendarProps> = ({
  apiBaseUrl,
  onImportSuccess,
  onImportError
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем расширение файла
    if (!file.name.toLowerCase().endsWith('.ics')) {
      onImportError?.('Пожалуйста, выберите файл .ics (iCalendar)');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('calendar', file);

    try {
      // Имитация прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

            const response = await fetch(`${apiBaseUrl}/tasks/import`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Ошибка ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ Импорт календаря успешен:', result);
      
      if (result.imported === 0) {
        onImportError?.('Не удалось импортировать события. Возможно, они уже существуют или файл пуст.');
      } else {
        // Вызываем с количеством импортированных событий
        onImportSuccess?.(result.imported);
      }
    } catch (error: any) {
      console.error('❌ Ошибка импорта календаря:', error);
      onImportError?.(error.message || 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="import-calendar-button"
      >
        {isUploading ? (
          <>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </div>
            Импорт... {uploadProgress}%
          </>
        ) : (
          <>
            <svg viewBox="0 0 25 25" fill="currentColor">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <span>Импорт календаря</span>
          </>
        )}
      </button>

      {isUploading && uploadProgress > 0 && (
        <div style={{
          width: '100%',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          marginTop: '8px',
          overflow: 'hidden'
        }}>
          <div 
            style={{
              width: `${uploadProgress}%`,
              height: '6px',
              backgroundColor: '#198754',
              transition: 'width 0.3s',
              borderRadius: '10px'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImportCalendar;