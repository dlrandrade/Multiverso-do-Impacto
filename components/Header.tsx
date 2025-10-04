import React from 'react';
import { LightningBoltIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center bg-black/20 border border-blue-500/30 rounded-full p-3 mb-4">
        <LightningBoltIcon className="w-8 h-8 text-yellow-400" />
      </div>
      <h1 className="text-6xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-yellow-300 font-heading tracking-wide uppercase">
        O Multiverso do Impacto
      </h1>
      <p className="mt-4 text-lg text-slate-300 max-w-xl mx-auto">
        Carregue sua foto e transforme-se em um herói futurista. A IA irá te reimaginar dentro do universo visual "Jovens de Impacto".
      </p>
    </header>
  );
};