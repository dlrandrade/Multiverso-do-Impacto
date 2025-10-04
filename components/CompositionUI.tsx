import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { DownloadIcon, RefreshIcon } from './icons';

interface CompositionUIProps {
  backgroundImageUrl: string;
  heroImageUrl: string;
  onDownload: () => void;
  onReset: () => void;
}

export interface CompositionUICanvas {
  exportToDataURL: () => string;
}

export const CompositionUI = forwardRef<CompositionUICanvas, CompositionUIProps>(({ 
  backgroundImageUrl, 
  heroImageUrl, 
  onDownload, 
  onReset 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heroTransform, setHeroTransform] = useState({ x: 0, y: 0, scale: 0.8, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, heroX: 0, heroY: 0 });
  
  const bgImageRef = useRef(new Image());
  const heroImageRef = useRef(new Image());

  useImperativeHandle(ref, () => ({
    exportToDataURL: () => {
      return canvasRef.current?.toDataURL('image/png') || '';
    }
  }));
  
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const bgImage = bgImageRef.current;
    const heroImage = heroImageRef.current;

    if (!canvas || !ctx || !bgImage.complete || !heroImage.complete || bgImage.naturalWidth === 0) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(heroTransform.x, heroTransform.y);
    ctx.rotate(heroTransform.rotation * Math.PI / 180);
    
    const heroAspectRatio = heroImage.naturalWidth / heroImage.naturalHeight;
    const heroHeight = canvas.height * 0.7 * heroTransform.scale; 
    const heroWidth = heroHeight * heroAspectRatio;

    ctx.drawImage(heroImage, -heroWidth / 2, -heroHeight / 2, heroWidth, heroHeight);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bgImage = bgImageRef.current;
    const heroImage = heroImageRef.current;
    bgImage.crossOrigin = "anonymous";
    heroImage.crossOrigin = "anonymous";
    
    let loadedImages = 0;
    const totalImages = 2;

    const onImageLoad = () => {
        loadedImages++;
        if (loadedImages === totalImages) {
            const aspectRatio = bgImage.naturalWidth / bgImage.naturalHeight;
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientWidth / aspectRatio;
            
            setHeroTransform(prev => ({ ...prev, x: canvas.width / 2, y: canvas.height / 2 }));
        }
    };

    bgImage.onload = onImageLoad;
    heroImage.onload = onImageLoad;
    
    if (bgImage.src !== backgroundImageUrl) {
      bgImage.src = backgroundImageUrl;
    }
    if (heroImage.src !== heroImageUrl) {
      heroImage.src = heroImageUrl;
    }

  }, [backgroundImageUrl, heroImageUrl]);

  useEffect(() => {
    redrawCanvas();
  }, [heroTransform]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setIsDragging(true);
    setDragStart({ 
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        heroX: heroTransform.x,
        heroY: heroTransform.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - dragStart.x;
    const dy = mouseY - dragStart.y;
    
    setHeroTransform(prev => ({
      ...prev,
      x: dragStart.heroX + dx,
      y: dragStart.heroY + dy,
    }));
  };
  
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-4xl font-bold mb-2 text-center font-heading tracking-wider uppercase">Componha sua Cena</h2>
      <p className="text-slate-300 mb-6 text-center">Arraste, redimensione e rotacione seu herói para criar a imagem perfeita.</p>
      
      <canvas
        ref={canvasRef}
        className="w-full max-w-2xl mx-auto aspect-auto rounded-lg shadow-2xl shadow-yellow-400/30 border-2 border-blue-500/50 cursor-move mb-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label htmlFor="scale" className="block text-lg font-semibold text-slate-300">Tamanho</label>
            <input 
                type="range" id="scale" min="0.1" max="2" step="0.01"
                value={heroTransform.scale}
                onChange={(e) => setHeroTransform(prev => ({...prev, scale: parseFloat(e.target.value)}))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>
           <div className="space-y-2">
            <label htmlFor="rotation" className="block text-lg font-semibold text-slate-300">Rotação</label>
            <input 
                type="range" id="rotation" min="0" max="360" step="1"
                value={heroTransform.rotation}
                onChange={(e) => setHeroTransform(prev => ({...prev, rotation: parseFloat(e.target.value)}))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105 font-heading text-lg tracking-wider uppercase"
        >
          <DownloadIcon className="w-5 h-5" />
          Baixar Imagem
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-800/70 text-white font-bold rounded-lg hover:bg-blue-700/70 transition-colors transform hover:scale-105 font-heading text-lg tracking-wider uppercase"
        >
          <RefreshIcon className="w-5 h-5" />
          Começar de Novo
        </button>
      </div>
    </div>
  );
});