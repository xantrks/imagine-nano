/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Feature } from './EditingPanel';
import { ChevronLeftIcon } from './icons';

interface MapToolPanelProps {
    feature: Feature;
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    onBack: () => void;
    options: { style?: string };
    onOptionsChange: (options: { style?: string }) => void;
}

const MapToolPanel: React.FC<MapToolPanelProps> = ({
    feature,
    prompt,
    onPromptChange,
    onGenerate,
    isLoading,
    onBack,
    options,
    onOptionsChange,
}) => {
    return (
        <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center gap-2">
                <button 
                    onClick={onBack} 
                    className="p-2 rounded-md hover:bg-[#4a4a4a] transition-colors"
                    aria-label="Back to features"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-semibold text-gray-200">{feature.name}</h2>
            </div>

            <div 
                className="bg-[#3c3c3c] rounded-lg p-4 flex flex-col gap-5 border border-black/20 relative overflow-hidden"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/subtle-carbon.png')`, backgroundBlendMode: 'overlay', backgroundColor: '#3c3c3c' }}
            >
                {/* Decorative map background */}
                <div 
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `url('https://static.vecteezy.com/system/resources/previews/000/423/065/original/vector-abstract-world-map-background.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                ></div>
                
                <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="location-prompt-input" className="text-xs text-gray-400">Location / Landmark</label>
                        <textarea
                            id="location-prompt-input"
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            placeholder={feature.samplePrompts[0] || 'Describe a location...'}
                            rows={3}
                            className="w-full bg-[#2b2b2b] border border-black/30 text-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                        />
                    </div>

                    {feature.options?.styles && (
                         <div className="flex flex-col gap-2">
                            <label htmlFor="style-select" className="text-xs text-gray-400">Artistic Style</label>
                            <select
                                id="style-select"
                                value={options.style}
                                onChange={(e) => onOptionsChange({ style: e.target.value })}
                                className="w-full bg-[#2b2b2b] border border-black/30 text-gray-200 rounded-md p-2 text-sm focus:ring-1 focus:ring-orange-500 focus:outline-none transition"
                            >
                                {feature.options.styles.map(style => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2 mt-2">
                        <button 
                            onClick={onGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full bg-[#2689ff] hover:bg-[#1a7ee6] text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 ease-in-out active:scale-95 disabled:bg-[#2b2b2b] disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapToolPanel;
