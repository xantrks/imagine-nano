/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { CompositionReferenceIcon, TrashIcon, ChevronLeftIcon, PlusIcon } from './icons';

interface GenerativePanelProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isReady: boolean;
    referenceImages: File[];
    onReferenceImagesChange: (files: File[]) => void;
    title?: string;
    placeholder?: string;
    showBackButton?: boolean;
    onBack?: () => void;
}

const GenerativePanel: React.FC<GenerativePanelProps> = ({
    prompt,
    onPromptChange,
    onGenerate,
    isLoading,
    isReady,
    referenceImages,
    onReferenceImagesChange,
    title = "Generative Layer",
    placeholder = "Describe a global change to the image...",
    showBackButton = false,
    onBack,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        const urls = referenceImages.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [referenceImages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            onReferenceImagesChange([...referenceImages, ...newFiles]);
        }
    };

    const handleChooseImage = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (indexToRemove: number) => {
        onReferenceImagesChange(referenceImages.filter((_, index) => index !== indexToRemove));
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-5 animate-fade-in">
             <div className="flex items-center gap-2">
                {showBackButton && (
                    <button 
                        onClick={onBack} 
                        className="p-2 rounded-md hover:bg-[#4a4a4a] transition-colors"
                        aria-label="Back to features"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                )}
                <h2 className="text-sm font-semibold text-gray-200">{title}</h2>
            </div>


            <div className="bg-[#3c3c3c] rounded-lg p-4 flex flex-col gap-5 border border-black/20">
                <div className="flex flex-col gap-2">
                    <label htmlFor="prompt-input" className="text-xs text-gray-400">Prompt</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full bg-[#2b2b2b] border border-black/30 text-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h3 className="text-xs text-gray-400">Reference Image(s)</h3>
                     <div className="grid grid-cols-3 gap-2">
                        {previewUrls.map((url, index) => (
                            <div key={url} className="relative w-full aspect-square bg-[#2b2b2b] border border-black/30 rounded-md">
                                <img src={url} alt={`Reference ${index + 1}`} className="w-full h-full object-contain rounded" />
                                <button 
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-1 right-1 bg-gray-800/70 hover:bg-red-500 text-white rounded-full p-0.5 transition-colors"
                                    aria-label="Remove image"
                                >
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                         <button 
                            onClick={handleChooseImage}
                            className="w-full aspect-square text-sm bg-[#4a4a4a] hover:bg-[#5a5a5a] text-white font-semibold rounded-md transition-colors text-center flex items-center justify-center"
                            aria-label="Add reference image"
                        >
                            <PlusIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                    />
                </div>
                
                <div className="flex flex-col gap-2 mt-2">
                    <button 
                        onClick={onGenerate}
                        disabled={isLoading || !isReady}
                        className="w-full bg-[#2689ff] hover:bg-[#1a7ee6] text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 ease-in-out active:scale-95 disabled:bg-[#2b2b2b] disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerativePanel;