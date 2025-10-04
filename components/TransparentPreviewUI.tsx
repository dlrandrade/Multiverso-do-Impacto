import React from 'react';
import { RefreshIcon, SparklesIcon } from './icons';

interface TransparentPreviewUIProps {
  heroImageUrl: string;
  onConfirm: () => void;
  onReset: () => void;
}

export const TransparentPreviewUI: React.FC<TransparentPreviewUIProps> = ({ heroImageUrl, onConfirm, onReset }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-4xl font-bold mb-2 text-center font-heading tracking-wider uppercase">Fundo Removido!</h2>
      <p className="text-slate-300 mb-6 text-center">Seu herói está pronto para a cena. Vamos compor a imagem final.</p>
      <div 
        className="relative w-full max-w-lg aspect-square mb-6 rounded-lg shadow-2xl shadow-yellow-400/30 border-2 border-blue-500/50"
        style={{ 
          backgroundImage: `
            linear-gradient(45deg, #334155 25%, transparent 25%), 
            linear-gradient(-45deg, #334155 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #334155 75%),
            linear-gradient(-45deg, transparent 75%, #334155 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#1e293b'
        }}
      >
        <img
          src={heroImageUrl}
          alt="Hero with transparent background"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105 font-heading text-lg tracking-wider uppercase"
        >
          <SparklesIcon className="w-5 h-5" />
          Continuar para Composição
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
};