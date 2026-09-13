import React from 'react';

export default function StoreNavbar({ onGoToAdmin, onResetStore, onOpenCart }) {
    return (
        <header className="bg-[#0B0D12] border-b border-[#1A1D26] sticky top-0 z-40 px-4 sm:px-8 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                
                {/* Brand Logo */}
                <div 
                    onClick={onResetStore}
                    className="font-serif text-xl font-bold tracking-tight text-white cursor-pointer select-none"
                >
                    Store<span className="text-[#10B981] font-sans">DZ</span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 text-xs font-semibold">

                    <div className="text-gray-400 flex items-center gap-2">
                        <span className="cursor-pointer hover:text-white">EN</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:text-white">FR</span>
                        <span>|</span>
                        <span className="cursor-pointer hover:text-white">AR</span>
                    </div>

                    <button 
                        onClick={onOpenCart}
                        className="bg-[#10B981] hover:bg-[#059669] text-black font-extrabold px-4 py-2 rounded-full transition-all flex items-center gap-2 cursor-pointer"
                    >
                        Cart
                    </button>
                </div>

            </div>
        </header>
    );
}