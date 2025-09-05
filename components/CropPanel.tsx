/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface CropPanelProps {
    onApplyCrop: () => void;
    onAspectChange: (aspect: number | undefined) => void;
    isLoading: boolean;
}

const aspectRatios = [
    { name: 'Free', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '3:4', value: 3 / 4 },
    { name: '16:9', value: 16 / 9 },
    { name: '9:16', value: 9 / 16 },
];

const CropPanel: React.FC<CropPanelProps> = ({ onApplyCrop, onAspectChange, isLoading }) => {
    const [selectedAspect, setSelectedAspect] = React.useState<number | undefined>(undefined);

    const handleAspectClick = (aspect: number | undefined) => {
        setSelectedAspect(aspect);
        onAspectChange(aspect);
    };

    return (
        <div className="animate-fade-in flex flex-col h-full gap-5">
            <h2 className="text-sm font-semibold text-gray-200">Crop Image</h2>
            
            <div className="bg-[#3c3c3c] rounded-lg p-4 flex flex-col gap-5 border border-black/20">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                        {aspectRatios.map(({ name, value }) => (
                            <button
                                key={name}
                                onClick={() => handleAspectClick(value)}
                                className={`py-2 px-3 text-sm rounded-md transition-colors ${selectedAspect === value ? 'bg-[#2689ff] text-white font-semibold' : 'bg-[#4a4a4a] hover:bg-[#5a5a5a]'}`}
                                aria-pressed={selectedAspect === value}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                    <button
                        onClick={onApplyCrop}
                        disabled={isLoading}
                        className="w-full bg-[#2689ff] hover:bg-[#1a7ee6] text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 ease-in-out active:scale-95 disabled:bg-[#2b2b2b] disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CropPanel;
