/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateEditedImage } from './services/geminiService';
import { generateImageFromText } from './services/geminiService';
import Header from './components/Header';
import Spinner from './components/Spinner';
import StartScreen from './components/StartScreen';
import EditingPanel, { Feature } from './components/EditingPanel';
import { features, filters, generativeLayerFeature } from './features';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';


// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

const getFeatureByName = (name: string): Feature | undefined => {
  for (const category in features) {
    const found = features[category].find(f => f.name === name);
    if (found) return found;
  }
  return undefined;
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const App: React.FC = () => {
  const [history, setHistory] = useState<File[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editHotspot, setEditHotspot] = useState<{ x: number, y: number } | null>(null);
  const [displayHotspot, setDisplayHotspot] = useState<{ x: number, y: number } | null>(null);
  
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  
  const [activeTab, setActiveTab] = useState<'features' | 'filters' | 'generative' | 'crop'>('features');
  const [selectedFeature, setSelectedFeature] = useState<Feature>(features["Core Editing Tools"][0]);

  const [galleryItems, setGalleryItems] = useState<File[]>([]);
  const [showSaveNotification, setShowSaveNotification] = useState<boolean>(false);
  
  // New state for map tool options
  // FIX: Explicitly type `mapOptions` state to match the expected prop type in child components.
  const [mapOptions, setMapOptions] = useState<{ style?: string }>({ style: 'Watercolor' });

  // Crop state
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>();

  const isGlobalFeature = selectedFeature.isGlobal;
  const isReadyToGenerate = isGlobalFeature ? !!prompt.trim() : !!prompt.trim() && !!editHotspot;

  const currentImage = history[historyIndex] ?? null;
  const originalImage = history[0] ?? null;

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  // Effect to create and revoke object URLs safely for the current image
  useEffect(() => {
    if (currentImage) {
      const url = URL.createObjectURL(currentImage);
      setCurrentImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCurrentImageUrl(null);
    }
  }, [currentImage]);
  
  // Effect to create and revoke object URLs safely for the original image
  useEffect(() => {
    if (originalImage) {
      const url = URL.createObjectURL(originalImage);
      setOriginalImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setOriginalImageUrl(null);
    }
  }, [originalImage]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addImageToHistory = useCallback((newImageFile: File) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newImageFile);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleImageUpload = useCallback((file: File) => {
    setError(null);
    setHistory([file]);
    setHistoryIndex(0);
    setEditHotspot(null);
    setDisplayHotspot(null);
  }, []);

  const runImageGenerationFromText = useCallback(async (
      fullPrompt: string
  ) => {
      setIsLoading(true);
      setError(null);
      try {
          const generatedImageUrl = await generateImageFromText(fullPrompt);
          const newImageFile = dataURLtoFile(generatedImageUrl, `generated-${Date.now()}.png`);
          handleImageUpload(newImageFile); 
          setPrompt('');
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(`Failed to generate the image. ${errorMessage}`);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  }, [handleImageUpload]);

  const runGeneration = useCallback(async (
    systemInstruction: string,
    userPrompt: string,
    hotspot: { x: number; y: number; } | null
    ) => {
      if (!currentImage) {
          setError('No image loaded to edit.');
          return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
          const editedImageUrl = await generateEditedImage(
              currentImage,
              userPrompt,
              systemInstruction,
              hotspot,
              referenceImages
          );
          const newImageFile = dataURLtoFile(editedImageUrl, `edited-${Date.now()}.png`);
          addImageToHistory(newImageFile);
          setEditHotspot(null);
          setDisplayHotspot(null);
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setError(`Failed to generate the image. ${errorMessage}`);
          console.error(err);
      } finally {
          setIsLoading(false);
      }
  }, [currentImage, referenceImages, addImageToHistory]);

  const handleInstantApply = useCallback((featureName: string) => {
    const feature = getFeatureByName(featureName);
    if (!feature || !feature.isInstant || !feature.instantPrompt) return;
    runGeneration(feature.systemInstruction, feature.instantPrompt, null);
  }, [runGeneration]);

  const handleApplyFilter = useCallback((filterPrompt: string) => {
      const systemInstruction = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
      
Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- You MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
      runGeneration(systemInstruction, filterPrompt, null);
  }, [runGeneration]);


  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
        setError('Please enter a description or location.');
        return;
    }

    if (selectedFeature.toolType === 'map') {
        let fullPrompt = `${selectedFeature.systemInstruction}\n\nLocation: "${prompt}"`;
        if (selectedFeature.name === "Map Painter") {
            fullPrompt += `\n\nStyle: "${mapOptions.style}"`;
        }
        runImageGenerationFromText(fullPrompt);
        return;
    }

    if (!isGlobalFeature && !editHotspot) {
        setError('Please click on the image to select an area to edit for this feature.');
        return;
    }
    runGeneration(selectedFeature.systemInstruction, prompt, editHotspot);
  }, [prompt, editHotspot, selectedFeature, isGlobalFeature, runGeneration, runImageGenerationFromText, mapOptions]);

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) {
        setError("No crop selection has been made.");
        return;
    }
    if (!currentImage) {
        setError("Cannot crop, no image is loaded.");
        return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setError('Could not get canvas context for cropping.');
        return;
    }

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    
    ctx.drawImage(
        image,
        cropX,
        cropY,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const base64Image = canvas.toDataURL(currentImage.type || 'image/png');
    const newImageFile = dataURLtoFile(base64Image, `cropped-${Date.now()}.png`);
    addImageToHistory(newImageFile);
    
    setActiveTab('features'); // Go back to features after crop
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, [completedCrop, currentImage, addImageToHistory]);

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, newAspect);
        setCrop(newCrop);
    } else {
        setCrop(undefined);
    }
  };


  const handleUndo = useCallback(() => {
    if (canUndo) {
      setHistoryIndex(historyIndex - 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [canUndo, historyIndex]);
  
  const handleRedo = useCallback(() => {
    if (canRedo) {
      setHistoryIndex(historyIndex + 1);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [canRedo, historyIndex]);

  const handleReset = useCallback(() => {
    if (history.length > 0) {
      setHistoryIndex(0);
      setError(null);
      setEditHotspot(null);
      setDisplayHotspot(null);
    }
  }, [history]);

  const handleUploadNew = useCallback(() => {
      setHistory([]);
      setHistoryIndex(-1);
      setError(null);
      setPrompt('');
      setEditHotspot(null);
      setDisplayHotspot(null);
      setReferenceImages([]);
  }, []);

  const handleDownload = useCallback(() => {
      if (currentImage) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(currentImage);
          link.download = `edited-${currentImage.name}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      }
  }, [currentImage]);
  
    const handleSaveToGallery = useCallback(() => {
        if (currentImage) {
            setGalleryItems(prevItems => [currentImage, ...prevItems]);
            setShowSaveNotification(true);
            setTimeout(() => setShowSaveNotification(false), 2000);
        }
    }, [currentImage]);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isGlobalFeature || selectedFeature.toolType === 'map') return;
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDisplayHotspot({ x: offsetX, y: offsetY });

    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;

    const originalX = Math.round(offsetX * scaleX);
    const originalY = Math.round(offsetY * scaleY);

    setEditHotspot({ x: originalX, y: originalY });
};

const handleTabChange = useCallback((tab: 'features' | 'filters' | 'generative' | 'crop') => {
    setActiveTab(tab);
    if (tab === 'generative') {
        setSelectedFeature(generativeLayerFeature);
    } else if (tab === 'crop') {
        setCrop(undefined);
        setCompletedCrop(undefined);
    }
}, []);


  const renderEditorContent = () => {
    if (error) {
       return (
           <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center animate-fade-in bg-red-500/10 border border-red-500/20 p-8 rounded-lg max-w-2xl mx-auto flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
                    <p className="text-md text-red-400">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Left column for image */}
            <div className="flex-grow relative flex items-center justify-center p-8 overflow-auto">
                {activeTab === 'crop' ? (
                    currentImageUrl &&
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            minWidth={50}
                        >
                            <img
                                ref={imgRef}
                                src={currentImageUrl}
                                alt="Crop preview"
                                className="object-contain max-h-[calc(100vh-112px)]"
                            />
                        </ReactCrop>
                    ) : (
                        <div className="relative">
                            {originalImageUrl && (
                                <img
                                    key={originalImageUrl}
                                    src={originalImageUrl}
                                    alt="Original"
                                    className="w-full h-auto object-contain max-h-[calc(100vh-112px)] pointer-events-none"
                                />
                            )}
                            {currentImageUrl && <img
                                ref={imgRef}
                                key={currentImageUrl}
                                src={currentImageUrl}
                                alt="Current"
                                onClick={handleImageClick}
                                className={`absolute top-0 left-0 w-full h-auto object-contain max-h-[calc(100vh-112px)] transition-opacity duration-200 ease-in-out ${isComparing ? 'opacity-0' : 'opacity-100'} ${!isGlobalFeature ? 'cursor-crosshair' : ''}`}
                            />}
                            {displayHotspot && !isLoading && (
                                <div 
                                    className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
                                    style={{ left: `${displayHotspot.x}px`, top: `${displayHotspot.y}px` }}
                                >
                                    <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
                                </div>
                            )}
                            {currentImageUrl && !isGlobalFeature && !editHotspot && !isLoading && selectedFeature.toolType !== 'map' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none animate-fade-in">
                                    <p className="text-white text-lg font-semibold bg-black/50 p-4 rounded-md">Click on the image to select an edit area</p>
                                </div>
                            )}
                        </div>
                    )
                }
            </div>
            
            {/* Right column for controls */}
            <aside className="w-[360px] flex-shrink-0 h-full">
                <EditingPanel
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    onGenerate={handleGenerate}
                    isReadyToGenerate={isReadyToGenerate}
                    referenceImages={referenceImages}
                    onReferenceImagesChange={setReferenceImages}
                    onUndo={handleUndo}
                    canUndo={canUndo}
                    onRedo={handleRedo}
                    canRedo={canRedo}
                    onCompareChange={setIsComparing}
                    onReset={handleReset}
                    onUploadNew={handleUploadNew}
                    onSaveToGallery={handleSaveToGallery}
                    onDownload={handleDownload}
                    isLoading={isLoading}
                    selectedFeature={selectedFeature}
                    onSelectedFeatureChange={setSelectedFeature}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onInstantApply={handleInstantApply}
                    onApplyFilter={handleApplyFilter}
                    onApplyCrop={handleApplyCrop}
                    onAspectChange={handleAspectChange}
                    mapOptions={mapOptions}
                    onMapOptionsChange={setMapOptions}
                />
            </aside>
        </>
    );
  };
  
  if (!currentImage) {
    return <StartScreen onFileSelect={handleFileSelect} galleryItems={galleryItems} />;
  }

  return (
    <div className="min-h-screen text-gray-100 flex flex-col bg-[#202020] h-screen overflow-hidden">
      <Header />
      <main className="flex-grow flex flex-row w-full relative">
        {isLoading && (
            <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center gap-4 animate-fade-in">
                <Spinner />
                <p className="text-gray-300">AI is working its magic...</p>
            </div>
        )}
        {showSaveNotification && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600/90 text-white font-semibold py-2 px-6 rounded-lg z-50 animate-fade-in shadow-lg">
                Image saved to gallery!
            </div>
        )}
        {renderEditorContent()}
      </main>
    </div>
  );
};

export default App;
