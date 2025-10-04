import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Loader } from './components/Loader';
import { generateHeroImage } from './services/geminiService';
import { AppState, ODS } from './types';
import { BackgroundRemovalUI } from './components/BackgroundRemovalUI';
import { CompositionUI, CompositionUICanvas } from './components/CompositionUI';
import { TransparentPreviewUI } from './components/TransparentPreviewUI';
import { removeChromaKey } from './lib/imageUtils';
import { defaultBackgroundImage } from './lib/backgrounds';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [userImage, setUserImage] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | string | null>(defaultBackgroundImage);
  const [generatedHeroWithBg, setGeneratedHeroWithBg] = useState<string>('');
  const [transparentHero, setTransparentHero] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedODS, setSelectedODS] = useState<ODS>(ODS.NONE);
  const compositionCanvasRef = useRef<CompositionUICanvas>(null);

  const backgroundUrl = useMemo(() => {
    if (!backgroundFile) return '';
    if (typeof backgroundFile === 'string') return backgroundFile;
    return URL.createObjectURL(backgroundFile);
  }, [backgroundFile]);

  const handleImageSelect = useCallback((file: File) => {
    setUserImage(file);
    setError(null);
  }, []);

  const handleBackgroundChange = useCallback((fileOrUrl: File | string | null) => {
    setBackgroundFile(fileOrUrl);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!userImage) {
      setError("Por favor, selecione uma imagem para o herói.");
      return;
    };
    if (!backgroundFile) {
      setError("Por favor, selecione uma imagem de fundo.");
      return;
    }
    if (selectedODS === ODS.NONE) {
        setError("Por favor, escolha uma missão (ODS) para o seu herói.");
        return;
    }

    setAppState(AppState.GENERATING_HERO);
    setError(null);
    try {
      const imageUrl = await generateHeroImage(userImage, customPrompt, selectedODS);
      setGeneratedHeroWithBg(imageUrl);
      setAppState(AppState.BACKGROUND_REMOVAL);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao gerar a imagem.');
      setAppState(AppState.ERROR);
    }
  }, [userImage, customPrompt, selectedODS, backgroundFile]);
  
  const handleColorSelectedForRemoval = useCallback(async (color: { r: number; g: number; b: number }) => {
      if (!generatedHeroWithBg) return;
      setAppState(AppState.REMOVING_BACKGROUND);
      setError(null);
      try {
          const transparentImageUrl = await removeChromaKey(generatedHeroWithBg, color);
          setTransparentHero(transparentImageUrl);
          setAppState(AppState.PREVIEW_TRANSPARENT);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao remover o fundo da imagem.');
        setAppState(AppState.ERROR);
      }
  }, [generatedHeroWithBg]);

  const handleStartComposition = useCallback(() => {
    setAppState(AppState.COMPOSING);
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setUserImage(null);
    setBackgroundFile(defaultBackgroundImage);
    setGeneratedHeroWithBg('');
    setTransparentHero('');
    setCustomPrompt('');
    setError(null);
    setSelectedODS(ODS.NONE);
  }, []);
  
  const handleDownload = () => {
      const dataUrl = compositionCanvasRef.current?.exportToDataURL();
      if (dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'meu-heroi-multiverso-composicao.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Não foi possível gerar a imagem para download.");
      }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.GENERATING_HERO:
        return <Loader message="Forjando seu herói..." />;
      case AppState.BACKGROUND_REMOVAL:
        return <BackgroundRemovalUI 
            heroImageUrl={generatedHeroWithBg} 
            onColorSelect={handleColorSelectedForRemoval} 
            onReset={handleReset} 
        />
      case AppState.REMOVING_BACKGROUND:
        return <Loader message="Processando transparência..." />;
      case AppState.PREVIEW_TRANSPARENT:
        return <TransparentPreviewUI
          heroImageUrl={transparentHero}
          onConfirm={handleStartComposition}
          onReset={handleReset}
        />
      case AppState.COMPOSING:
        return <CompositionUI 
            ref={compositionCanvasRef}
            backgroundImageUrl={backgroundUrl}
            heroImageUrl={transparentHero}
            onDownload={handleDownload}
            onReset={handleReset}
        />
      case AppState.IDLE:
      case AppState.IMAGE_SELECTED:
      case AppState.ERROR:
      default:
        return (
          <>
            <ImageUploader
              onImageSelect={handleImageSelect}
              onGenerate={handleGenerate}
              userImage={userImage}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
              backgroundFile={backgroundFile}
              onBackgroundChange={handleBackgroundChange}
              selectedODS={selectedODS}
              onODSChange={setSelectedODS}
            />
            {error && <p className="mt-4 text-red-400 text-center bg-red-900/50 p-3 rounded-md border border-red-500/50">{error}</p>}
          </>
        );
    }
  };

  const isInitialScreen = appState === AppState.IDLE || appState === AppState.IMAGE_SELECTED || appState === AppState.ERROR;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed text-white font-sans transition-all duration-500" 
      style={{ backgroundImage: backgroundUrl && isInitialScreen ? `url(${backgroundUrl})` : 'none' }}
    >
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 ${isInitialScreen ? 'bg-black/70 backdrop-blur-sm' : ''}`}>
        <div className="w-full max-w-4xl mx-auto space-y-8">
          <Header />
          <main className="bg-slate-900/50 border border-blue-500/20 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-md">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;