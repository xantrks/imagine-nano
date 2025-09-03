/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { filters } from '../features';

interface FilterPanelProps {
    onApplyFilter: (prompt: string) => void;
    isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, isLoading }) => {
    return (
        <div className="animate-fade-in flex flex-col h-full">
            <h2 className="flex-shrink-0 text-sm font-bold text-gray-200 p-4 pb-2">AI Filters</h2>
            {/*
              The height `h-80` (320px) is calculated to fit exactly two rows of square filters.
              Panel width (360px) - padding (32px) = 328px content area.
              Item width = (328px - 16px gap) / 2 = 156px.
              Item height = 156px.
              Total height for 2 rows = 156px + 16px gap + 156px = 328px. h-80 is the closest Tailwind class.
            */}
            <div className="overflow-y-auto px-4 pb-4 h-80">
                <div className="grid grid-cols-2 gap-4">
                    {filters.map((filter) => (
                        <button
                            key={filter.name}
                            onClick={() => onApplyFilter(filter.prompt)}
                            disabled={isLoading}
                            className="group aspect-square bg-cover bg-center rounded-md overflow-hidden relative transition-transform duration-200 ease-in-out hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{ backgroundImage: `url(${filter.imageUrl})` }}
                            aria-label={`Apply ${filter.name} filter`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity group-hover:from-black/90"></div>
                            <span className="absolute bottom-2 left-2 text-sm font-semibold text-white transition-transform group-hover:translate-y-[-2px]">
                                {filter.name}
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;