import React, { useState, useEffect, useCallback } from 'react';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import BentoHero from '../../components/BentoHero';

export default function Catalog({ 
    onSelectProduct, 
    onGoToCheckout, 
    onCartCheckout,
    isCartOpen: externalIsCartOpen,
    setIsCartOpen: externalSetIsCartOpen
}) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Server Query States
    const [selectedCategorySlug, setSelectedCategorySlug] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sort, setSort] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Cart State
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('storedz_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Support both parent-controlled and local cart drawer state
    const [internalIsCartOpen, setInternalIsCartOpen] = useState(false);
    const isCartOpen = externalIsCartOpen !== undefined ? externalIsCartOpen : internalIsCartOpen;
    const setIsCartOpen = externalSetIsCartOpen || setInternalIsCartOpen;

    // Selected Product View State
    const [activeModalProduct, setActiveModalProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    useEffect(() => {
        localStorage.setItem('storedz_cart', JSON.stringify(cart));
    }, [cart]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesRes = await api.getCategories();
                setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.categories || []);
            } catch (err) {
                console.error('Erreur chargement catégories:', err);
            }
        };
        fetchCategories();
    }, []);

    // Debounce Search Input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Products from Backend
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const queryParams = { page, limit: 10 };

            if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
            if (selectedCategorySlug !== 'ALL') queryParams.category = selectedCategorySlug;
            if (minPrice) queryParams.minPrice = minPrice;
            if (maxPrice) queryParams.maxPrice = maxPrice;
            if (sort) queryParams.sort = sort;

            const res = await api.getProducts(queryParams);
            setProducts(res.products || []);
            setTotalPages(res.pages || 1);
            setTotalProducts(res.total || 0);
        } catch (err) {
            setError(err.message || 'Impossible de charger les produits.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategorySlug, minPrice, maxPrice, sort, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Hero Selection Handler with Auto-Scroll & Filter
    const handleHeroCategorySelect = (categorySlug) => {
        setSelectedCategorySlug(categorySlug);
        setPage(1);

        // Scroll cleanly to the products grid section
        const catalogSection = document.getElementById('catalog-products-section');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Open Product Detail View
    const handleOpenProduct = (product) => {
        setActiveModalProduct(product);
        setSelectedImageIndex(0);

        const availableColors = product.variants && product.variants.length > 0
            ? [...new Set(product.variants.map(v => v.color).filter(Boolean))]
            : (product.colors || []);

        const availableSizes = product.variants && product.variants.length > 0
            ? [...new Set(product.variants.map(v => v.size).filter(Boolean))]
            : (product.sizes || []);

        setSelectedColor(availableColors[0] || '');
        setSelectedSize(availableSizes[0] || '');
        setSelectedQuantity(1);
    };

    // Add to Cart
    const handleAddToCart = (product, color, size, qty = 1, openCart = true) => {
        const itemKey = `${product._id}-${color || 'default'}-${size || 'default'}`;
        
        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(item => item.key === itemKey);
            if (existingIndex > -1) {
                return prevCart.map((item, index) => 
                    index === existingIndex 
                        ? { ...item, quantity: item.quantity + qty } 
                        : item
                );
            }
            return [...prevCart, {
                key: itemKey,
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.url || product.imageUrl || product.images?.[0],
                color,
                size,
                quantity: qty
            }];
        });

        if (openCart) {
            setIsCartOpen(true);
        }
    };

    // Buy Now Handler
    const handleBuyNow = (product, color, size, qty) => {
        const selectedVariant = product?.variants?.find(
            v => v.color === color && v.size === size
        );
        const variantId = selectedVariant?._id || null;

        const newItem = {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: qty,
            variantId,
            color,
            size,
            image: product.images?.[0]?.url || product.imageUrl
        };

        setActiveModalProduct(null);

        if (onSelectProduct) {
            onSelectProduct(product._id, { variantId, color, size, qty });
        } else if (onCartCheckout) {
            const currentCart = JSON.parse(localStorage.getItem('storedz_cart') || '[]');
            onCartCheckout([...currentCart, newItem]);
        }
    };

    const updateQuantity = (itemKey, delta) => {
        setCart(prev => prev.map(item => {
            if (item.key === itemKey) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeFromCart = (itemKey) => {
        setCart(prev => prev.filter(item => item.key !== itemKey));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const getProductImages = (product) => {
        if (!product) return [];
        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images.map(img => typeof img === 'string' ? img : img.url);
        }
        if (product.imageUrl) return [product.imageUrl];
        return ['/placeholder.png'];
    };

    const modalColors = activeModalProduct?.variants?.length > 0
        ? [...new Set(activeModalProduct.variants.map(v => v.color).filter(Boolean))]
        : (activeModalProduct?.colors || []);

    const modalSizes = activeModalProduct?.variants?.length > 0
        ? [...new Set(activeModalProduct.variants.map(v => v.size).filter(Boolean))]
        : (activeModalProduct?.sizes || []);

    return (
        <div className="bg-[#0B0D12] text-gray-100 min-h-screen pb-16 font-sans selection:bg-[#10B981] selection:text-black">
            
            {/* Bento Grid Hero Banner (With live categories & click navigation) */}
            {!activeModalProduct && (
                <BentoHero 
                    categories={categories} 
                    onSelectCategory={handleHeroCategorySelect} 
                />
            )}

            {/* SEARCH & FILTERS CONTAINER - Hidden in Detail View */}
            {!activeModalProduct && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4 space-y-3">
                    {/* Search Input Bar */}
                    <div className="relative">
                        <input 
                            type="text" 
                            value={searchTerm || ''}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher des produits..." 
                            className="w-full bg-[#161821] border border-[#222634] text-sm text-gray-200 placeholder-gray-500 rounded-2xl py-3 px-4 focus:outline-none focus:border-[#10B981] transition-colors shadow-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Price Range & Sorting Controls */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <input 
                            type="number"
                            placeholder="Prix min (DZD)"
                            value={minPrice}
                            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                            className="flex-1 min-w-[110px] sm:min-w-[130px] bg-[#161821] border border-[#222634] text-xs text-gray-200 placeholder-gray-500 rounded-xl py-2.5 px-3 sm:px-4 focus:outline-none focus:border-[#10B981] transition-colors"
                        />
                        <input 
                            type="number"
                            placeholder="Prix max (DZD)"
                            value={maxPrice}
                            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                            className="flex-1 min-w-[110px] sm:min-w-[130px] bg-[#161821] border border-[#222634] text-xs text-gray-200 placeholder-gray-500 rounded-xl py-2.5 px-3 sm:px-4 focus:outline-none focus:border-[#10B981] transition-colors"
                        />
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value); setPage(1); }}
                            className="w-full sm:w-auto sm:flex-1 min-w-[140px] sm:min-w-[160px] bg-[#161821] border border-[#222634] text-xs text-gray-200 rounded-xl py-2.5 px-3 sm:px-4 focus:outline-none focus:border-[#10B981] transition-colors cursor-pointer"
                        >
                            <option value="">Trier par: Nouveautés</option>
                            <option value="price_asc">Prix: Croissant</option>
                            <option value="price_desc">Prix: Décroissant</option>
                        </select>

                        {(minPrice || maxPrice || sort) && (
                            <button 
                                onClick={() => { setMinPrice(''); setMaxPrice(''); setSort(''); setPage(1); }}
                                className="w-full sm:w-auto bg-[#222634] hover:bg-[#2A2F42] text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6">
                
                {/* FULL PRODUCT DETAIL VIEW OVERLAY */}
                {activeModalProduct ? (
                    <div className="bg-[#161821] border border-[#222634] rounded-3xl p-4 sm:p-6 md:p-10 my-4 md:my-8 shadow-2xl">
                        
                        <button 
                            onClick={() => setActiveModalProduct(null)}
                            className="bg-[#222634] hover:bg-[#2A2F42] text-gray-300 font-bold text-xs px-5 py-2.5 rounded-full mb-6 sm:mb-8 transition-colors flex items-center gap-2"
                        >
                            ← Back to Products
                        </button>

                        {(() => {
                            const images = getProductImages(activeModalProduct);
                            return (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                    
                                    {/* Gallery */}
                                    <div className="flex flex-col-reverse md:flex-row gap-4">
                                        {images.length > 1 && (
                                            <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-none md:max-h-[480px] pb-2 md:pb-0">
                                                {images.map((img, idx) => (
                                                    <button 
                                                        key={idx}
                                                        onClick={() => setSelectedImageIndex(idx)}
                                                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                            selectedImageIndex === idx ? 'border-[#10B981]' : 'border-[#222634] bg-white/5'
                                                        }`}
                                                    >
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="relative flex-1 bg-white rounded-2xl h-64 sm:h-80 md:h-[440px] flex items-center justify-center p-4 sm:p-6 border border-[#222634] overflow-hidden">
                                            <img 
                                                src={images[selectedImageIndex] || images[0]} 
                                                alt={activeModalProduct.name} 
                                                className="max-w-full max-h-full object-contain" 
                                            />

                                            {images.length > 1 && (
                                                <>
                                                    <button 
                                                        onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                                        className="absolute left-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black transition-colors"
                                                    >
                                                        ‹
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                                        className="absolute right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black transition-colors"
                                                    >
                                                        ›
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Details Panel */}
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <span className="text-xs font-black uppercase tracking-wider text-[#10B981] mb-2 block">
                                                {activeModalProduct.category?.name || 'STORE DZ'}
                                            </span>

                                            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                                                {activeModalProduct.name}
                                            </h1>

                                            <div className="inline-block bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-bold px-3 py-1 rounded-full mb-4 sm:mb-6">
                                                In Stock • Cash on Delivery
                                            </div>

                                            <div className="text-2xl sm:text-3xl font-black text-white mb-6">
                                                {activeModalProduct.price} <span className="text-sm font-semibold text-gray-400">DZD</span>
                                            </div>

                                            {/* Colors Selection */}
                                            {modalColors.length > 0 && (
                                                <div className="mb-6">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                        Color: <span className="text-white">{selectedColor}</span>
                                                    </label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {modalColors.map((color) => (
                                                            <button
                                                                key={color}
                                                                onClick={() => setSelectedColor(color)}
                                                                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                                                    selectedColor === color 
                                                                        ? 'border-[#10B981] bg-[#10B981] text-black' 
                                                                        : 'border-[#222634] bg-[#0D0E14] text-gray-300 hover:border-gray-500'
                                                                }`}
                                                            >
                                                                {color}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sizes Selection */}
                                            {modalSizes.length > 0 && (
                                                <div className="mb-6">
                                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                        Size: <span className="text-white">{selectedSize}</span>
                                                    </label>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {modalSizes.map((size) => (
                                                            <button
                                                                key={size}
                                                                onClick={() => setSelectedSize(size)}
                                                                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                                                                    selectedSize === size 
                                                                        ? 'border-[#10B981] bg-[#10B981] text-black' 
                                                                        : 'border-[#222634] bg-[#0D0E14] text-gray-300 hover:border-gray-500'
                                                                }`}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Quantity */}
                                            <div className="mb-8">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Quantity</label>
                                                <div className="inline-flex items-center bg-[#0D0E14] border border-[#222634] rounded-full px-4 py-1.5 gap-4">
                                                    <button 
                                                        onClick={() => setSelectedQuantity(q => Math.max(1, q - 1))}
                                                        className="text-gray-400 hover:text-white font-bold text-lg"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-extrabold text-sm text-white">{selectedQuantity}</span>
                                                    <button 
                                                        onClick={() => setSelectedQuantity(q => q + 1)}
                                                        className="text-gray-400 hover:text-white font-bold text-lg"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Triggers */}
                                        <div className="flex flex-col gap-3">
                                            <button 
                                                onClick={() => handleAddToCart(activeModalProduct, selectedColor, selectedSize, selectedQuantity, true)}
                                                className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider py-4 rounded-full transition-all shadow-lg shadow-[#10B981]/20 cursor-pointer"
                                            >
                                                Add to Cart
                                            </button>

                                            <button 
                                                onClick={() => handleBuyNow(activeModalProduct, selectedColor, selectedSize, selectedQuantity)}
                                                className="w-full bg-[#222634] hover:bg-[#2A2F42] text-white font-black text-xs uppercase tracking-wider py-4 rounded-full transition-all cursor-pointer"
                                            >
                                                Buy Now ↗
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    /* MAIN STOREFRONT CATALOG SPLIT VIEW */
                    <div className="grid grid-cols-12 gap-8 my-6">
                        
                        {/* LEFT SIDEBAR */}
                        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
                            <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider mb-4">
                                Categories
                            </h3>
                            
                            <ul className="space-y-1 text-xs font-medium">
                                <li>
                                    <button
                                        onClick={() => { setSelectedCategorySlug('ALL'); setPage(1); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                            selectedCategorySlug === 'ALL' 
                                                ? 'bg-[#161821] text-[#10B981] font-bold border-l-2 border-[#10B981]' 
                                                : 'text-gray-400 hover:text-white hover:bg-[#161821]/50'
                                        }`}
                                    >
                                        All Products
                                    </button>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat._id}>
                                        <button
                                            onClick={() => { setSelectedCategorySlug(cat.slug); setPage(1); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                selectedCategorySlug === cat.slug 
                                                    ? 'bg-[#161821] text-[#10B981] font-bold border-l-2 border-[#10B981]' 
                                                    : 'text-gray-400 hover:text-white hover:bg-[#161821]/50'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* RIGHT SECTION (Anchor point for scrolling target) */}
                        <section id="catalog-products-section" className="col-span-12 md:col-span-9 lg:col-span-10 scroll-mt-6">
                            
                            {/* Horizontal Category Pills */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
                                <button
                                    onClick={() => { setSelectedCategorySlug('ALL'); setPage(1); }}
                                    className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                                        selectedCategorySlug === 'ALL' 
                                            ? 'bg-[#10B981] text-black' 
                                            : 'bg-[#161821] text-gray-400 border border-[#222634] hover:border-gray-500'
                                    }`}
                                >
                                    New Arrivals
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        onClick={() => { setSelectedCategorySlug(cat.slug); setPage(1); }}
                                        className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                                            selectedCategorySlug === cat.slug 
                                                ? 'bg-[#10B981] text-black' 
                                                : 'bg-[#161821] text-gray-400 border border-[#222634] hover:border-gray-500'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Products Grid */}
                            {loading ? (
                                <div className="text-center py-20 text-gray-500 text-xs uppercase tracking-widest">
                                    Loading products...
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-20 bg-[#161821] rounded-2xl border border-[#222634] text-gray-500 text-xs uppercase tracking-wider">
                                    No products found.
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                                        {products.map((product) => {
                                            const productImage = product.images?.[0]?.url || product.imageUrl || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

                                            return (
                                                <div 
                                                    key={product._id} 
                                                    onClick={() => handleOpenProduct(product)}
                                                    className="group cursor-pointer flex flex-col justify-between bg-[#161821] border border-[#222634] p-2.5 sm:p-3 rounded-2xl hover:border-[#10B981] transition-all"
                                                >
                                                    <div className="relative bg-white rounded-xl h-36 sm:h-52 flex items-center justify-center p-2 sm:p-4 overflow-hidden mb-2 sm:mb-3 border border-[#1A1D26] shadow-sm">
                                                        {productImage ? (
                                                            <img 
                                                                src={productImage} 
                                                                alt={product.name} 
                                                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" 
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No Image</span>
                                                        )}

                                                        <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleOpenProduct(product);
                                                                }}
                                                                className="w-full bg-[#0B0D12]/90 backdrop-blur-md text-white hover:bg-[#10B981] hover:text-black font-extrabold text-[11px] uppercase tracking-wider py-2 rounded-xl transition-colors shadow-lg"
                                                            >
                                                                See More Details
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="px-1 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 block mb-0.5 truncate">
                                                                {product.category?.name || 'STORE DZ'}
                                                            </span>
                                                            <h3 className="font-sans text-xs sm:text-sm font-semibold text-gray-200 leading-snug line-clamp-1 mb-1 group-hover:text-white transition-colors">
                                                                {product.name}
                                                            </h3>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-2">
                                                            <span className="font-sans font-extrabold text-xs sm:text-sm text-white">
                                                                {product.price} <span className="text-[10px] sm:text-xs font-medium text-gray-400">DZD</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-12">
                                            <button
                                                disabled={page === 1}
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold transition-colors ${
                                                    page === 1 
                                                        ? 'border-[#222634] text-gray-600 cursor-not-allowed' 
                                                        : 'border-[#222634] text-gray-300 hover:bg-[#161821] hover:text-white'
                                                }`}
                                            >
                                                ◄ Prev
                                            </button>
                                            <span className="text-[11px] sm:text-xs font-bold text-gray-400">
                                                Page {page} of {totalPages}
                                            </span>
                                            <button
                                                disabled={page === totalPages}
                                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs font-bold transition-colors ${
                                                    page === totalPages 
                                                        ? 'border-[#222634] text-gray-600 cursor-not-allowed' 
                                                        : 'border-[#222634] text-gray-300 hover:bg-[#161821] hover:text-white'
                                                }`}
                                            >
                                                Next ►
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                        </section>

                    </div>
                )}

            </main>

            {/* SLIDE-OUT CART DRAWER PANEL */}
            {isCartOpen && (
                <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end">
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#161821] border-l border-[#222634] h-full p-4 sm:p-6 flex flex-col justify-between shadow-2xl">
                        
                        <div>
                            <div className="flex items-center justify-between border-b border-[#222634] pb-4 mb-6">
                                <h2 className="font-serif text-lg sm:text-xl font-bold text-white">Your Cart ({cartCount})</h2>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white font-bold text-lg p-1">✕</button>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
                                {cart.length === 0 ? (
                                    <div className="text-center text-gray-500 py-16 text-xs uppercase tracking-wider">
                                        Your cart is currently empty.
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.key} className="flex items-center gap-3 bg-[#0D0E14] p-3 rounded-2xl border border-[#222634]">
                                            <img src={item.image || '/placeholder.png'} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-white/5" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                                                {(item.color || item.size) && (
                                                    <p className="text-[10px] text-gray-400">
                                                        {item.color && `Color: ${item.color} `}
                                                        {item.size && `Size: ${item.size}`}
                                                    </p>
                                                )}
                                                <p className="text-xs font-black text-[#10B981] mt-0.5">{item.price} DZD</p>
                                            </div>

                                            <div className="flex items-center gap-2 bg-[#161821] border border-[#222634] rounded-lg px-2 py-1 text-xs">
                                                <button onClick={() => updateQuantity(item.key, -1)} className="text-gray-400 hover:text-white font-bold">-</button>
                                                <span className="font-bold text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.key, 1)} className="text-gray-400 hover:text-white font-bold">+</button>
                                            </div>

                                            <button onClick={() => removeFromCart(item.key)} className="text-red-400/80 hover:text-red-400 p-1 text-xs">
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {cart.length > 0 && (
                            <div className="border-t border-[#222634] pt-4">
                                <div className="flex justify-between text-sm font-black text-white mb-4">
                                    <span>Total:</span>
                                    <span className="text-[#10B981]">{cartTotal} DZD</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        if (onGoToCheckout) {
                                            onGoToCheckout();
                                        } else if (onCartCheckout) {
                                            onCartCheckout(cart);
                                        }
                                    }}
                                    className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-black text-xs uppercase tracking-wider py-4 rounded-full transition-all cursor-pointer shadow-lg shadow-[#10B981]/20 active:scale-95"
                                >
                                    Proceed to Checkout ({cartTotal} DZD)
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Footer Component */}
            <Footer />
        
        </div>
    );
}