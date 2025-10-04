import React, { useRef, useEffect } from 'react';
import { RefreshIcon, SparklesIcon } from './icons';

interface BackgroundRemovalUIProps {
  heroImageUrl: string;
  onColorSelect: (color: { r: number; g: number; b: number }) => void;
  onReset: () => void;
}

export const BackgroundRemovalUI: React.FC<BackgroundRemovalUIProps> = ({ heroImageUrl, onColorSelect, onReset }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = heroImageUrl;
    image.onload = () => {
      // Ajusta o tamanho do canvas para o tamanho da imagem para manter a resolução
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);
    };
     image.onerror = () => {
        console.error("Error loading image for canvas.");
    }
  }, [heroImageUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calcula o fator de escala, caso o tamanho de exibição do canvas seja diferente do seu tamanho de pixel
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = { r: pixel[0], g: pixel[1], b: pixel[2] };
    
    onColorSelect(color);
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="flex items-center gap-3 text-4xl font-bold mb-2 text-center font-heading tracking-wider uppercase">
        <SparklesIcon className="w-8 h-8 text-yellow-300" />
        Use a Varinha Mágica
      </h2>
      <p className="text-slate-300 mb-6 text-center">Clique na cor do fundo (verde) para torná-la transparente.</p>
      
      <div 
        className="relative w-full max-w-lg aspect-square mb-6 bg-green-500 rounded-lg shadow-2xl shadow-green-400/30 border-2 border-green-500/50"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain rounded-lg cursor-crosshair"
          aria-label="Clique para remover o fundo"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-800/70 text-white font-bold rounded-lg hover:bg-blue-700/70 transition-colors transform hover:scale-105 font-heading text-lg tracking-wider uppercase"
        >
          <RefreshIcon className="w-5 h-5" />
          Criar Outro
        </button>
      </div>
    </div>
  );
};