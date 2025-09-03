/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BananaIcon, EditIcon, PlusIcon, ViewGridIcon, HomeIcon } from './icons';

interface GalleryItem {
    name: string;
    time: string;
    url: string;
}

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  galleryItems: File[];
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, galleryItems }) => {
  const [view, setView] = useState<'home' | 'gallery'>('home');
  const [savedFiles, setSavedFiles] = useState<GalleryItem[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  useEffect(() => {
    // Create new object URLs for the gallery items passed from the App state
    const newSavedFiles = galleryItems.map(file => ({
        name: file.name,
        time: 'Just now',
        url: URL.createObjectURL(file),
    }));

    setSavedFiles(newSavedFiles);
    
    // Cleanup function to revoke the object URLs when the component unmounts or galleryItems change
    return () => {
        newSavedFiles.forEach(item => URL.revokeObjectURL(item.url));
    };
  }, [galleryItems]);


  const renderMainContent = () => {
    if (view === 'gallery') {
      return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-6">Explore Gallery</h1>
            {savedFiles.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                    {savedFiles.map(file => (
                        <div key={file.url} className="group">
                            <div className="aspect-square bg-[#3c3c3c] rounded-md overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
                                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-white text-sm mt-2 truncate">{file.name}</h4>
                            <p className="text-gray-400 text-xs">{file.time}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold text-gray-400">Your Gallery is Empty</h2>
                    <p className="text-gray-500 mt-2">Save images from the editor to see them here.</p>
                </div>
            )}
        </div>
      );
    }

    // Home View - clean and simple
    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold text-white">Imagine Nano</h1>
            <p className="text-xl text-gray-400 mt-1">image editing reimagined with ai</p>
        </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#2b2b2b] text-gray-300 font-sans">
      <aside className="w-64 flex-shrink-0 bg-[#202020] p-2 flex flex-col gap-2 border-r border-black/20">
        <div className="flex justify-between items-center p-2 mb-2">
            <div className="flex items-center gap-2">
                <BananaIcon className="w-7 h-7" />
                <span className="font-semibold text-white">Imagine Nano</span>
            </div>
            <button className="text-gray-400 hover:text-white" aria-label="New Project">
                <EditIcon className="w-5 h-5" />
            </button>
        </div>
        
        <nav className="flex flex-col gap-1 px-2">
            <label htmlFor="file-upload-start" className="w-full text-left text-white font-semibold py-2 px-3 rounded-md transition-all duration-200 ease-in-out bg-[#4a4a4a] hover:bg-[#5a5a5a] cursor-pointer flex items-center gap-3">
                <PlusIcon className="w-5 h-5" /> New File
            </label>
            <input id="file-upload-start" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />

            <button onClick={() => setView('home')} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === 'home' ? 'bg-[#3a3a3a] text-white' : 'hover:bg-[#3a3a3a] text-gray-300'}`}>
                <HomeIcon className="w-5 h-5" /> Home
            </button>
            <button onClick={() => setView('gallery')} className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${view === 'gallery' ? 'bg-[#3a3a3a] text-white' : 'hover:bg-[#3a3a3a] text-gray-300'}`}>
                <ViewGridIcon className="w-5 h-5" /> Explore
            </button>
        </nav>

        <div className="flex-grow flex flex-col overflow-y-auto mt-2 pt-2 border-t border-white/10">
            <div className="h-full flex items-center justify-center p-4">
                <p className="text-gray-500 text-sm text-center italic">Unable to load history</p>
            </div>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default StartScreen;