/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import {
    HomeIcon, LightBulbIcon, FolderIcon, UsersIcon, LightroomIcon, TrashIcon, ViewListIcon, ViewGridIcon, InfoIcon
} from './icons';

interface GalleryItem {
    name: string;
    time: string;
    url: string;
    type: 'placeholder' | 'user';
}

interface StartScreenProps {
  onFileSelect: (files: FileList | null) => void;
  galleryItems: File[];
}

// Static placeholder data to match the screenshot
const placeholderFiles: GalleryItem[] = [
    { name: 'Puppy and Bunny.psdc', time: '3 minutes ago', url: 'https://images.unsplash.com/photo-1593134257782-e895c7c79604?w=400&q=80', type: 'placeholder' },
    { name: 'APC_0005-hdr.dng', time: '5 minutes ago', url: 'https://images.unsplash.com/photo-1608303598013-3375829a28b7?w=400&q=80', type: 'placeholder' },
    { name: 'churchsteps2.jpg', time: '5 minutes ago', url: 'https://images.unsplash.com/photo-1542992088-8884787a7401?w=400&q=80', type: 'placeholder' },
    { name: 'IMG_1507.jpg', time: '5 minutes ago', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=80', type: 'placeholder' },
    { name: 'IMG_1536_edited-1.psd', time: '6 minutes ago', url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=400&q=80', type: 'placeholder' },
    { name: 'PS Sample File 1.psd', time: '6 minutes ago', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d42e2?w=400&q=80', type: 'placeholder' },
    { name: 'IMG_1497.jpg', time: '6 minutes ago', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80', type: 'placeholder' },
];


const StartScreen: React.FC<StartScreenProps> = ({ onFileSelect, galleryItems }) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  const userSavedFiles: GalleryItem[] = galleryItems.map(file => ({
    name: file.name,
    time: 'Just now',
    url: URL.createObjectURL(file),
    type: 'user'
  }));
  
  const allFiles = [...userSavedFiles, ...placeholderFiles];

  // Remember to revoke URLs when component unmounts to prevent memory leaks
  React.useEffect(() => {
    return () => {
      userSavedFiles.forEach(file => URL.revokeObjectURL(file.url));
    };
  }, [galleryItems]);


  return (
    <div className="flex h-screen w-full bg-[#323232] text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#3c3c3c] p-4 flex flex-col gap-6 border-r border-black/20">
        <nav className="flex flex-col gap-2">
            <label htmlFor="file-upload-start" className="w-full text-center text-white font-semibold py-2 px-3 rounded-full transition-all duration-200 ease-in-out bg-[#2689ff] hover:bg-[#1a7ee6] cursor-pointer">
                New file
            </label>
             <input id="file-upload-start" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            <button className="w-full text-center text-white font-semibold py-2 px-3 rounded-full transition-all duration-200 ease-in-out bg-[#535353] hover:bg-[#636363]">
                Open
            </button>
        </nav>

        <nav className="flex flex-col gap-1">
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors bg-[#535353] text-white">
                <HomeIcon className="w-5 h-5" /> Home
            </button>
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors hover:bg-[#535353] text-gray-300">
                <LightBulbIcon className="w-5 h-5" /> Learn
            </button>
        </nav>

        <nav className="flex flex-col gap-1">
            <h3 className="text-xs font-bold text-gray-500 px-3">FILES</h3>
             <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors hover:bg-[#535353] text-gray-300">
                <FolderIcon className="w-5 h-5" /> Your files
            </button>
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors hover:bg-[#535353] text-gray-300">
                <UsersIcon className="w-5 h-5" /> Shared with you
            </button>
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors hover:bg-[#535353] text-gray-300">
                <LightroomIcon className="w-5 h-5" /> Lightroom photos
            </button>
            <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left transition-colors hover:bg-[#535353] text-gray-300">
                <TrashIcon className="w-5 h-5" /> Deleted
            </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Suggestions Section */}
        <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">Suggestions <InfoIcon className="w-5 h-5 text-gray-500" /></h2>
                <button className="text-sm text-gray-400 hover:text-white">Hide suggestions</button>
            </div>
            <div className="bg-[#3c3c3c] rounded-lg p-6 flex items-center justify-between gap-6">
                <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Popular now</p>
                    <h3 className="text-xl font-bold text-white mb-2">Change the background of a photo</h3>
                    <p className="text-sm text-gray-400 mb-4">Learn how to quickly and easily give your image a new background.</p>
                    <button className="text-sm font-semibold text-white bg-[#535353] hover:bg-[#636363] py-2 px-5 rounded-full transition-colors">View tutorial</button>
                </div>
                <div className="w-64 h-36 rounded-md overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1628999333358-69022c4516a2?w=400&q=80" alt="Desert fashion" className="w-full h-full object-cover"/>
                </div>
            </div>
        </section>

        {/* Recent Files Section */}
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Recent</h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Filter</span>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-[#535353] rounded-md text-white"><ViewListIcon className="w-5 h-5" /></button>
                        <button className="p-1.5 bg-[#3c3c3c] rounded-md text-gray-400"><ViewGridIcon className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-6">
                {allFiles.map(file => (
                    <div key={file.url} className="group">
                        <div className="aspect-[4/3] bg-[#3c3c3c] rounded-md overflow-hidden transition-transform duration-200 group-hover:-translate-y-1 border-2 border-transparent group-hover:border-blue-500">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-white text-sm mt-2 font-medium truncate">{file.name}</h4>
                        <p className="text-gray-400 text-xs">{file.time}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
};

export default StartScreen;