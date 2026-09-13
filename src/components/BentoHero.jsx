import React from 'react';

export default function BentoHero({ onShopCategory }) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
            {/* Mobile: Horizontal Swipe Carousel | Desktop: 3-Tile Bento Grid */}
            <div className="flex md:grid md:grid-cols-12 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0">
                
                {/* TILE 1: Minimalist Home Decor */}
                <div className="min-w-[85%] sm:min-w-[80%] md:min-w-0 md:col-span-6 relative rounded-3xl overflow-hidden bg-[#161821] border border-[#222634] group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80" 
                        alt="Minimalist Home Decor" 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-7 flex flex-col justify-end items-start">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 mb-2">
                            Featured Collection
                        </span>
                        <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#10B981] leading-tight mb-3 uppercase tracking-tight max-w-md">
                            Minimalist Home Decor: <span className="text-white block sm:inline">Curated Essentials</span>
                        </h2>
                        <button 
                            onClick={() => onShopCategory?.('home-decor')}
                            className="bg-[#10B981] hover:bg-[#059669] text-black font-black text-[11px] sm:text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#10B981]/20 cursor-pointer active:scale-95"
                        >
                            Shop The Look
                        </button>
                    </div>
                </div>

                {/* TILE 2: Level Up Your Setup */}
                <div className="min-w-[75%] sm:min-w-[70%] md:min-w-0 md:col-span-3 relative rounded-3xl overflow-hidden bg-[#161821] border border-[#222634] group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" 
                        alt="Tech Essentials" 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/30 to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end items-start">
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug mb-3 uppercase">
                            Level Up <br className="hidden sm:inline" />Your Setup
                        </h3>
                        <button 
                            onClick={() => onShopCategory?.('tech')}
                            className="bg-[#0B0D12]/90 hover:bg-[#222634] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all border border-gray-700/60 cursor-pointer active:scale-95"
                        >
                            Explore Tech
                        </button>
                    </div>
                </div>

                {/* TILE 3: Bold Innovations */}
                <div className="min-w-[75%] sm:min-w-[70%] md:min-w-0 md:col-span-3 relative rounded-3xl overflow-hidden bg-[#10B981] border border-[#10B981]/40 group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
                        alt="Bold Innovations" 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/80 via-transparent to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end items-start">
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-black text-white sm:text-black uppercase leading-tight tracking-tight mb-3">
                            Bold <br />Innovations
                        </h3>
                        <button 
                            onClick={() => onShopCategory?.('eco')}
                            className="bg-black/90 hover:bg-black text-white font-black text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all border border-[#10B981]/40 cursor-pointer active:scale-95"
                        >
                            Shop Eco Collection
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}