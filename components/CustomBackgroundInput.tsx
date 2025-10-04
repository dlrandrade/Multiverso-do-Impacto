import React, { useRef, useState, DragEvent, ChangeEvent, useEffect } from 'react';
import { UploadIcon } from './icons';

interface CustomBackgroundInputProps {
  background: File | string | null;
  onBackgroundChange: (background: File | string | null) => void;
}

export const CustomBackgroundInput: React.FC<CustomBackgroundInputProps> = ({ background, onBackgroundChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (background) {
      if (typeof background === 'string') {
        setPreviewUrl(background);
        setUrlInput(background);
      } else {
        objectUrl = URL.createObjectURL(background);
        setPreviewUrl(objectUrl);
        setUrlInput(''); // A file is not a URL string
      }
    } else {
      setPreviewUrl(null);
      setUrlInput('');
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [background]);


  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onBackgroundChange(file);
    }
  };
  
  const handleUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newUrl = e.target.value;
      setUrlInput(newUrl); // Update local state for typing UX
      
      // Basic URL validation before propagating
      if (newUrl.trim().match(/\.(jpeg|jpg|gif|png|webp)$/i) != null) {
          onBackgroundChange(newUrl);
      } else if (newUrl.trim() === '') {
          onBackgroundChange(null);
      }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-200 mb-2 text-center font-heading tracking-wider">2. Escolha o Fundo</h3>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`relative w-full aspect-video border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors ${isDragging ? 'border-blue-400 bg-blue-500/20' : 'border-blue-500/40 hover:border-blue-500'}`}
      >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
            accept="image/*"
        />
        {previewUrl ? (
            <img src={previewUrl} alt="Background Preview" className="w-full h-full object-cover rounded-md" />
        ) : (
            <div className="text-center">
                <UploadIcon className="w-8 h-8 text-slate-500 mb-2 mx-auto" />
                <p className="text-slate-400 font-semibold">Arraste uma imagem</p>
                <p className="text-slate-500 text-sm">ou clique para selecionar</p>
            </div>
        )}
      </div>
      <div className="mt-2 text-center text-slate-400 text-sm">ou</div>
      <input
        type="text"
        value={urlInput}
        onChange={handleUrlInputChange}
        placeholder="Cole a URL de uma imagem aqui"
        className="w-full mt-2 p-3 bg-black/20 border border-blue-500/30 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-slate-500"
        aria-label="Background image URL"
      />
    </div>
  );
};
