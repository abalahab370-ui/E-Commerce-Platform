import React from 'react';

export default function Footer() {
    return (
        <footer className="border-t border-[#1A1D26] bg-[#0B0D12] py-6 px-4 sm:px-8 mt-16 text-xs text-gray-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <span className="font-semibold text-gray-400">Algiers HQ</span>
                    <span className="hover:text-gray-300 cursor-pointer">Language</span>
                    <span className="hover:text-gray-300 cursor-pointer">Terms</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-gray-400">
                    <span className="cursor-pointer hover:text-white">EN</span>
                    <span>|</span>
                    <span className="cursor-pointer hover:text-white">FR</span>
                    <span>|</span>
                    <span className="cursor-pointer hover:text-white">AR</span>
                </div>
            </div>
        </footer>
    );
}