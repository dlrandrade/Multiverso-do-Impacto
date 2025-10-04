import React, { useState, useEffect } from 'react';

const defaultLoadingMessages = [
  "Entrando no Multiverso...",
  "Forjando seu herói...",
  "Canalizando energia cósmica...",
  "Renderizando sua lenda...",
  "Aplicando detalhes épicos...",
];

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  const [displayMessage, setDisplayMessage] = useState(message || defaultLoadingMessages[0]);

  useEffect(() => {
    if (!message) {
        const intervalId = setInterval(() => {
            setDisplayMessage(prev => {
                const currentIndex = defaultLoadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % defaultLoadingMessages.length;
                return defaultLoadingMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    } else {
        setDisplayMessage(message);
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center h-80 text-center">
        <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-yellow-400 rounded-full animate-ping opacity-75"></div>
        </div>
      <p className="mt-8 text-xl font-semibold text-slate-300 transition-opacity duration-500">
        {displayMessage}
      </p>
      <p className="mt-2 text-slate-500">Isso pode levar alguns instantes.</p>
    </div>
  );
};