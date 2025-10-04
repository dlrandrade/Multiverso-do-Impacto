import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadIcon } from './icons';
import { ODS } from '../types';
import { ODSSelector } from './ODSSelector';
import { CustomBackgroundInput } from './CustomBackgroundInput';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onGenerate: () => void;
  userImage: File | null;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  backgroundFile: File | string | null;
  onBackgroundChange: (background: File | string | null) => void;
  selectedODS: ODS;
  onODSChange: (ods: ODS) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageSelect, 
  onGenerate, 
  userImage, 
  customPrompt,
  onCustomPromptChange,
  backgroundFile,
  onBackgroundChange,
  selectedODS,
  onODSChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full space-y-8">
        
        {/* Step 1 & 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <ODSSelector selectedODS={selectedODS} onODSChange={onODSChange} />
            <CustomBackgroundInput background={backgroundFile} onBackgroundChange={onBackgroundChange} />
        </div>
        
        {/* Step 3 & 4 */}
        <div className="w-full text-center">
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-60 w-auto mx-auto rounded-lg shadow-lg mb-6 border-2 border-blue-500/50" />
            ) : (
                <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`w-full h-56 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors ${isDragging ? 'border-blue-400 bg-blue-500/20' : 'border-blue-500/40 hover:border-blue-500'}`}
                >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleInputChange}
                    className="hidden"
                    accept="image/*"
                />
                <UploadIcon className="w-12 h-12 text-slate-500 mb-4" />
                <p className="text-slate-400 text-xl font-heading tracking-wider">3. Arraste e solte a foto para o seu Herói</p>
                <p className="text-slate-500 text-sm">ou clique para selecionar</p>
                </div>
            )}
            
            <div className="w-full mt-6 text-left">
                <h3 className="text-2xl font-bold text-slate-200 mb-2 text-center font-heading tracking-wider">4. Descreva seu Herói (Opcional)</h3>
                <textarea
                    value={customPrompt}
                    onChange={(e) => onCustomPromptChange(e.target.value)}
                    placeholder="Por padrão: calça jeans e camisa branca. Descreva a roupa ou poderes aqui... Ex: Armadura de obsidiana com veios de magma brilhante."
                    className="w-full h-24 p-3 bg-black/20 border border-blue-500/30 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all placeholder:text-slate-500"
                    aria-label="Custom prompt for hero generation"
                />
            </div>
        </div>
      
      <button
        onClick={onGenerate}
        disabled={!userImage || selectedODS === ODS.NONE || !backgroundFile}
        className="w-full sm:w-auto px-12 py-3 text-2xl font-bold text-white rounded-full transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-600 disabled:to-slate-700 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 font-heading tracking-widest uppercase"
      >
        Gerar Herói
      </button>
    </div>
  );
};
