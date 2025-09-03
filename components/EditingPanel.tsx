/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UndoIcon, RedoIcon, EyeIcon, InfoIcon, SparklesIcon } from './icons';
import GenerativePanel from './GenerativePanel';
import { features } from '../features';
import FilterPanel from './FilterPanel';

export interface Feature {
    name: string;
    description: string;
    samplePrompts: string[];
    isInstant: boolean;
    isGlobal: boolean;
    systemInstruction: string;
    instantPrompt?: string;
}

interface EditingPanelProps {
    // GenerativePanel props
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    isReadyToGenerate: boolean;
    referenceImage: File | null;
    onReferenceImageChange: (file: File | null) => void;

    // History and actions
    onUndo: () => void;
    canUndo: boolean;
    onRedo: () => void;
    canRedo: boolean;
    onCompareChange: (isComparing: boolean) => void;
    onReset: () => void;
    onUploadNew: () => void;
    onSaveToGallery: () => void;
    onDownload: () => void;

    // Global state
    isLoading: boolean;
    
    // Feature selection
    selectedFeature: Feature;
    onSelectedFeatureChange: (feature: Feature) => void;

    // Tabs
    activeTab: 'features' | 'filters' | 'generative';
    onTabChange: (tab: 'features' | 'filters' | 'generative') => void;
    onInstantApply: (featureName: string) => void;
    onApplyFilter: (prompt: string) => void;
}

// ChevronDownIcon component for the accordion
const AccordionChevron: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const EditingPanel: React.FC<EditingPanelProps> = (props) => {
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
        "Core Editing Tools": true,
    });
    const [viewingFeature, setViewingFeature] = useState<Feature | null>(null);


    const toggleCategory = (category: string) => {
        setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };
    
    const handleSelectFeature = (feature: Feature) => {
        if (feature.isInstant) {
            props.onInstantApply(feature.name);
        } else {
            props.onSelectedFeatureChange(feature);
            setViewingFeature(feature);
        }
    };

    const handleTabChange = (tab: 'features' | 'filters' | 'generative') => {
        setViewingFeature(null);
        props.onTabChange(tab);
    }

    const renderFeaturesList = () => (
        <div className="animate-fade-in">
            <h2 className="text-sm font-bold text-gray-200 mb-4 px-2">AI Tools</h2>
            <div className="flex flex-col gap-2">
                {Object.entries(features).map(([category, items]) => (
                    <div key={category}>
                        <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-2 rounded-md hover:bg-[#3c3c3c]">
                            <h3 className="font-semibold text-sm text-gray-300">{category}</h3>
                            <AccordionChevron isOpen={!!openCategories[category]} />
                        </button>
                        {openCategories[category] && (
                            <div className="pl-2 pt-1 flex flex-col items-start gap-0.5">
                                {items.map(item => (
                                    <div key={item.name} className="group w-full flex items-center justify-between">
                                        <button 
                                            onClick={() => handleSelectFeature(item)}
                                            className={`flex-grow text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center gap-2 text-gray-400 hover:text-white`}
                                        >
                                            {item.name}
                                            {item.isInstant && <SparklesIcon className="w-4 h-4 text-yellow-400" />}
                                        </button>
                                        <div className="relative flex-shrink-0">
                                            <InfoIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-white" />
                                            <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-[#1f1f1f] border border-black/30 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                                <p className="font-semibold text-white mb-2">{item.name}</p>
                                                <p className="mb-2">{item.description}</p>
                                                {item.samplePrompts.length > 0 && (
                                                    <>
                                                        <p className="font-semibold text-gray-400">Sample Prompts:</p>
                                                        <ul className="list-disc pl-4 text-gray-400">
                                                            {item.samplePrompts.map((p, i) => <li key={i}>{p}</li>)}
                                                        </ul>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch(props.activeTab) {
            case 'features':
                return viewingFeature ? (
                    <GenerativePanel 
                        title={viewingFeature.name}
                        placeholder={viewingFeature.samplePrompts[0] || 'Describe your edit...'}
                        showBackButton={true}
                        onBack={() => setViewingFeature(null)}
                        prompt={props.prompt}
                        onPromptChange={props.onPromptChange}
                        onGenerate={props.onGenerate}
                        isLoading={props.isLoading}
                        isReady={props.isReadyToGenerate}
                        referenceImage={props.referenceImage}
                        onReferenceImageChange={props.onReferenceImageChange}
                    />
                ) : renderFeaturesList();
            case 'filters':
                 return (
                    <FilterPanel
                        onApplyFilter={props.onApplyFilter}
                        isLoading={props.isLoading}
                    />
                );
            case 'generative':
                return (
                    <GenerativePanel
                        prompt={props.prompt}
                        onPromptChange={props.onPromptChange}
                        onGenerate={props.onGenerate}
                        isLoading={props.isLoading}
                        isReady={props.isReadyToGenerate}
                        referenceImage={props.referenceImage}
                        onReferenceImageChange={props.onReferenceImageChange}
                    />
                );
            default:
                return null;
        }
    }


    return (
        <div className="bg-[#2b2b2b] h-full flex flex-col border-l border-black/20">
            {/* Tab Navigation */}
            <div className="flex-shrink-0 p-2 flex items-center gap-2 border-b border-black/20">
                <button 
                    onClick={() => handleTabChange('features')}
                    className={`flex-grow text-center text-sm font-semibold py-2 rounded-md transition-colors ${props.activeTab === 'features' ? 'bg-[#4a4a4a] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
                >
                    Features
                </button>
                <button 
                    onClick={() => handleTabChange('filters')}
                    className={`flex-grow text-center text-sm font-semibold py-2 rounded-md transition-colors ${props.activeTab === 'filters' ? 'bg-[#4a4a4a] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
                >
                    Filters
                </button>
                <button 
                    onClick={() => handleTabChange('generative')}
                    className={`flex-grow text-center text-sm font-semibold py-2 rounded-md transition-colors ${props.activeTab === 'generative' ? 'bg-[#4a4a4a] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'}`}
                >
                    Generative Layer
                </button>
            </div>
            
            {/* Panel Content */}
            <div className={`flex-grow min-h-0 ${props.activeTab !== 'filters' ? 'p-4 overflow-y-auto' : ''}`}>
                {renderContent()}
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 p-3 bg-[#202020] border-t border-black/20 flex flex-col gap-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button onClick={props.onUndo} disabled={!props.canUndo || props.isLoading} className="p-2 rounded-md hover:bg-[#4a4a4a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><UndoIcon className="w-5 h-5" /></button>
                        <button onClick={props.onRedo} disabled={!props.canRedo || props.isLoading} className="p-2 rounded-md hover:bg-[#4a4a4a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><RedoIcon className="w-5 h-5" /></button>
                    </div>
                     <button 
                        onMouseDown={() => props.onCompareChange(true)} 
                        onMouseUp={() => props.onCompareChange(false)}
                        onTouchStart={() => props.onCompareChange(true)}
                        onTouchEnd={() => props.onCompareChange(false)}
                        disabled={props.isLoading}
                        className="p-2 rounded-md hover:bg-[#4a4a4a] disabled:opacity-30 transition-colors"
                        title="Hold to compare original"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button onClick={props.onReset} disabled={!props.canUndo || props.isLoading} className="text-sm font-semibold text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Reset</button>
                </div>
                <div className="grid grid-cols-3 items-center gap-2">
                    <button onClick={props.onUploadNew} className="w-full bg-[#4a4a4a] hover:bg-[#5a5a5a] text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">Upload New</button>
                    <button onClick={props.onSaveToGallery} className="w-full bg-[#4a4a4a] hover:bg-[#5a5a5a] text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">Save</button>
                    <button onClick={props.onDownload} className="w-full bg-[#2689ff] hover:bg-[#1a7ee6] text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm">Download</button>
                </div>
            </div>
        </div>
    );
};

export default EditingPanel;