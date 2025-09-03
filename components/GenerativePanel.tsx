/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { CompositionReferenceIcon, TrashIcon, ChevronLeftIcon } from './icons';

interface GenerativePanelProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isReady: boolean;
    referenceImage: File | null;
    onReferenceImageChange: (file: File | null) => void;
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
    referenceImage,
    onReferenceImageChange,
    title = "Generative Layer",
    placeholder = "Describe a global change to the image...",
    showBackButton = false,
    onBack,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (referenceImage) {
            const url = URL.createObjectURL(referenceImage);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setImagePreviewUrl(null);
        }
    }, [referenceImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onReferenceImageChange(e.target.files[0]);
        }
    };

    const handleChooseImage = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        onReferenceImageChange(null);
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
                    <h3 className="text-xs text-gray-400">Reference Image</h3>
                    {imagePreviewUrl ? (
                         <div className="relative w-full aspect-video bg-[#2b2b2b] border border-black/30 rounded-md">
                            <img src={imagePreviewUrl} alt="Reference" className="w-full h-full object-contain rounded" />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-gray-800/70 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
                                aria-label="Remove image"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                         </div>
                    ) : (
                        <button 
                            onClick={handleChooseImage}
                            className="w-full text-sm bg-[#4a4a4a] hover:bg-[#5a5a5a] text-white font-semibold py-2 px-3 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                        >
                            <CompositionReferenceIcon className="w-5 h-5" />
                            Add Reference Image
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
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