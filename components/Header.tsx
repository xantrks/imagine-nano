/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BananaIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="w-full h-12 flex items-center justify-between px-4 bg-[#323232] border-b border-black/20 sticky top-0 z-50 flex-shrink-0">
      <div className="flex items-center gap-3">
        <BananaIcon className="w-7 h-7" />
        <h1 className="text-lg font-bold tracking-tight text-gray-100">
            Imagine Nano
        </h1>
      </div>
    </header>
  );
};

export default Header;