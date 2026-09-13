import React from 'react';

export default function BentoHero() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Tile 1: Minimalist Home Decor (5 cols) */}
                <div className="md:col-span-5 bg-[#161821] border border-[#222634] rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden min-h-[280px] group cursor-pointer">
                    <img 
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80" 
                        alt="Minimalist Home Decor" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent"></div>
                    <div className="relative z-10">
                        <h2 className="font-serif text-2xl font-bold text-white uppercase tracking-tight leading-tight max-w-xs">
                            Minimalist home decor: <br />
                            <span className="text-gray-300">Curated Essentials</span>
                        </h2>
                    </div>
                </div>

                {/* Tile 2: Tech Essentials (4 cols) */}
                <div className="md:col-span-4 bg-[#161821] border border-[#222634] rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden min-h-[280px] group cursor-pointer">
                    <img 
                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" 
                        alt="Tech Essentials" 
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-black/30 to-transparent"></div>
                    <div className="relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1 block">
                            Tech Essentials
                        </span>
                        <h3 className="font-serif text-xl font-bold text-white uppercase leading-tight">
                            Level Up <br />Your Setup
                        </h3>
                    </div>
                </div>

                {/* Tile 3: Bold Innovations (3 cols) */}
                <div className="md:col-span-3 bg-[#10B981] rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden min-h-[280px] group cursor-pointer">
                    <img 
                        src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
                        alt="Bold Innovations" 
                        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="relative z-10">
                        <h3 className="font-serif text-2xl font-black text-black uppercase leading-tight tracking-tight">
                            Bold <br />Innovations
                        </h3>
                    </div>
                </div>

            </div>
        </section>
    );
}