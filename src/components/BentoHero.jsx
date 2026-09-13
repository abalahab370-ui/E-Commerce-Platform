import React from 'react';

// Helper to extract image URL safely from array, object, or string
const getImageUrl = (bannerImage, fallbackUrl) => {
    if (!bannerImage) return fallbackUrl;
    if (Array.isArray(bannerImage) && bannerImage.length > 0) {
        return bannerImage[0]?.url || fallbackUrl;
    }
    if (typeof bannerImage === 'object' && bannerImage.url) {
        return bannerImage.url;
    }
    if (typeof bannerImage === 'string' && bannerImage.trim() !== '') {
        return bannerImage;
    }
    return fallbackUrl;
};

export default function BentoHero({ categories = [], onSelectCategory }) {
    // Filter backend categories flagged as featured
    const featured = categories.filter(cat => cat.isFeatured).slice(0, 3);

    // Fallbacks if fewer than 3 categories are marked as featured in DB
    const tile1 = featured[0] || {
        slug: 'ALL',
        name: 'Featured Collection',
        featuredTitle: 'Minimalist Home Decor:',
        featuredSubtitle: 'Curated Essentials',
        buttonText: 'Shop The Look',
        bannerImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'
    };

    const tile2 = featured[1] || {
        slug: 'ALL',
        name: 'Setup Essentials',
        featuredTitle: 'Level Up Your Setup',
        featuredSubtitle: '',
        buttonText: 'Explore Tech',
        bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    };

    const tile3 = featured[2] || {
        slug: 'ALL',
        name: 'Innovations',
        featuredTitle: 'Bold Innovations',
        featuredSubtitle: '',
        buttonText: 'Shop Collection',
        bannerImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    };

    // Extract resolved image URLs
    const img1 = getImageUrl(tile1.bannerImage, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80');
    const img2 = getImageUrl(tile2.bannerImage, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80');
    const img3 = getImageUrl(tile3.bannerImage, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80');

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
            <div className="flex md:grid md:grid-cols-12 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 md:pb-0">
                
               {/* TILE 1: Main Feature */}
                <div className="min-w-[85%] sm:min-w-[80%] md:min-w-0 md:col-span-6 relative rounded-3xl overflow-hidden bg-[#161821] border border-[#222634] group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src={img1} 
                        alt={tile1.name} 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/40 to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-7 flex flex-col justify-end items-start">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 mb-2">
                            {tile1.name}
                        </span>
                        
                        {/* Only render featuredTitle if it's explicitly provided, preventing name duplication */}
                        {tile1.featuredTitle && (
                            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-[#10B981] leading-tight mb-3 uppercase tracking-tight max-w-md">
                                {tile1.featuredTitle}{' '}
                                {tile1.featuredSubtitle && (
                                    <span className="text-white block sm:inline">{tile1.featuredSubtitle}</span>
                                )}
                            </h2>
                        )}

                        <button 
                            onClick={() => onSelectCategory(tile1.slug)}
                            className="bg-[#10B981] hover:bg-[#059669] text-black font-black text-[11px] sm:text-xs uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#10B981]/20 cursor-pointer active:scale-95"
                        >
                            {tile1.buttonText || 'Shop The Look'}
                        </button>
                    </div>
                </div>

                {/* TILE 2 */}
                <div className="min-w-[75%] sm:min-w-[70%] md:min-w-0 md:col-span-3 relative rounded-3xl overflow-hidden bg-[#161821] border border-[#222634] group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src={img2} 
                        alt={tile2.name} 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/30 to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end items-start">
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug mb-3 uppercase">
                            {tile2.featuredTitle || tile2.name}
                        </h3>
                        <button 
                            onClick={() => onSelectCategory(tile2.slug)}
                            className="bg-[#0B0D12]/90 hover:bg-[#222634] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all border border-gray-700/60 cursor-pointer active:scale-95"
                        >
                            {tile2.buttonText || 'Explore Category'}
                        </button>
                    </div>
                </div>

                {/* TILE 3 */}
                <div className="min-w-[75%] sm:min-w-[70%] md:min-w-0 md:col-span-3 relative rounded-3xl overflow-hidden bg-[#10B981] border border-[#10B981]/40 group h-[250px] sm:h-[300px] md:h-[350px] snap-center flex-shrink-0">
                    <img 
                        src={img3} 
                        alt={tile3.name} 
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/80 via-transparent to-transparent" />
                    
                    <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-end items-start">
                        <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-black text-white uppercase leading-tight tracking-tight mb-3">
                            {tile3.featuredTitle || tile3.name}
                        </h3>
                        <button 
                            onClick={() => onSelectCategory(tile3.slug)}
                            className="bg-black/90 hover:bg-black text-white font-black text-[11px] sm:text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all border border-[#10B981]/40 cursor-pointer active:scale-95"
                        >
                            {tile3.buttonText || 'Explore Category'}
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}