import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function Catalog({ onSelectProduct, onGoToCheckout ,onCartCheckout }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Server Query States
    const [selectedCategorySlug, setSelectedCategorySlug] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
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
    const [isCartOpen, setIsCartOpen] = useState(false);

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

            const res = await api.getProducts(queryParams);
            setProducts(res.products || []);
            setTotalPages(res.pages || 1);
            setTotalProducts(res.total || 0);
        } catch (err) {
            setError(err.message || 'Impossible de charger les produits.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategorySlug, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Open Product Detail View
    const handleOpenProduct = (product) => {
        setActiveModalProduct(product);
        setSelectedImageIndex(0);
        setSelectedColor(product.colors?.[0] || '');
        setSelectedSize(product.sizes?.[0] || '');
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

    // "Acheter maintenant" (Buy Now)
    const handleBuyNow = (product, color, size, qty) => {
        handleAddToCart(product, color, size, qty, false);
        setActiveModalProduct(null);
        if (onSelectProduct) {
            onSelectProduct(product._id);
        } else if (onCartCheckout) {
            onCartCheckout(cart);
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

    // Extract images list safely
    const getProductImages = (product) => {
        if (!product) return [];
        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images.map(img => typeof img === 'string' ? img : img.url);
        }
        if (product.imageUrl) return [product.imageUrl];
        return ['/placeholder.png'];
    };

    const handleProceedToCheckout = () => {
        setIsCartOpen(false);
        if (onGoToCheckout) {
            onGoToCheckout();
        } else if (onCartCheckout) {
            onCartCheckout(cart);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', margin: 0, cursor: 'pointer' }} onClick={() => setActiveModalProduct(null)}>
                    STORE<span style={{ color: '#10B981' }}>DZ</span>
                </h1>
                
                <button 
                    onClick={() => setIsCartOpen(true)}
                    style={{
                        padding: '10px 18px',
                        backgroundColor: '#0F172A',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '30px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    🛒 Mon Panier
                    {cartCount > 0 && (
                        <span style={{ backgroundColor: '#10B981', color: '#FFF', borderRadius: '50%', padding: '2px 7px', fontSize: '11px', fontWeight: '800' }}>
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* FULL PRODUCT DETAIL VIEW OVERLAY */}
            {activeModalProduct ? (
                <div style={{ backgroundColor: '#FFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: '16px' }}>
                    
                    {/* Back button */}
                    <button 
                        onClick={() => setActiveModalProduct(null)}
                        style={{ border: 'none', background: '#F1F5F9', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: '#475569', cursor: 'pointer', marginBottom: '24px' }}
                    >
                        ← Retour aux produits
                    </button>

                    {(() => {
                        const images = getProductImages(activeModalProduct);
                        return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
                                
                                {/* LEFT GALLERY: Thumbnails + Main Image */}
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    
                                    {/* Thumbnails vertical list */}
                                    {images.length > 1 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                                            {images.map((img, idx) => (
                                                <div 
                                                    key={idx}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    style={{
                                                        width: '64px',
                                                        height: '64px',
                                                        borderRadius: '8px',
                                                        border: selectedImageIndex === idx ? '2px solid #6366F1' : '1px solid #E2E8F0',
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Main Image View */}
                                    <div style={{ position: 'relative', flex: 1, backgroundColor: '#F8FAFC', borderRadius: '12px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #F1F5F9' }}>
                                        <img 
                                            src={images[selectedImageIndex] || images[0]} 
                                            alt={activeModalProduct.name} 
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '16px' }} 
                                        />

                                        {/* Prev / Next Arrows */}
                                        {images.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                                                    style={{ position: 'absolute', left: '12px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #CBD5E1', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ‹
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                                                    style={{ position: 'absolute', right: '12px', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #CBD5E1', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* RIGHT PANEL: Info & Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        {/* Vendor / Brand */}
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                                            {activeModalProduct.category?.name || 'STORE DZ'}
                                        </div>

                                        {/* Product Title */}
                                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                                            {activeModalProduct.name}
                                        </h1>

                                        {/* Stock Tag */}
                                        <div style={{ display: 'inline-block', backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', marginBottom: '16px' }}>
                                            En Stock • Paiement à la livraison
                                        </div>

                                        {/* Price */}
                                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '24px' }}>
                                            {activeModalProduct.price} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>DZD</span>
                                        </div>

                                        {/* Colors Selection */}
                                        {activeModalProduct.colors?.length > 0 && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
                                                    Couleur: <span style={{ fontWeight: '600', color: '#64748B' }}>{selectedColor}</span>
                                                </label>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {activeModalProduct.colors.map(c => (
                                                        <button 
                                                            key={c} 
                                                            onClick={() => setSelectedColor(c)} 
                                                            style={{ 
                                                                padding: '8px 16px', 
                                                                borderRadius: '20px', 
                                                                border: selectedColor === c ? '2px solid #0F172A' : '1px solid #CBD5E1', 
                                                                backgroundColor: selectedColor === c ? '#0F172A' : '#FFF',
                                                                color: selectedColor === c ? '#FFF' : '#0F172A',
                                                                fontSize: '12px', 
                                                                fontWeight: '700', 
                                                                cursor: 'pointer' 
                                                            }}
                                                        >
                                                            {c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sizes Selection */}
                                        {activeModalProduct.sizes?.length > 0 && (
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
                                                    Taille: <span style={{ fontWeight: '600', color: '#64748B' }}>{selectedSize}</span>
                                                </label>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {activeModalProduct.sizes.map(s => (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => setSelectedSize(s)} 
                                                            style={{ 
                                                                minWidth: '44px',
                                                                padding: '8px 12px', 
                                                                borderRadius: '20px', 
                                                                border: selectedSize === s ? '2px solid #0F172A' : '1px solid #CBD5E1', 
                                                                backgroundColor: selectedSize === s ? '#0F172A' : '#FFF',
                                                                color: selectedSize === s ? '#FFF' : '#0F172A',
                                                                fontSize: '12px', 
                                                                fontWeight: '700', 
                                                                cursor: 'pointer' 
                                                            }}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quantity Selector */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>Quantité</label>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '30px', padding: '4px 12px' }}>
                                                <button 
                                                    onClick={() => setSelectedQuantity(q => Math.max(1, q - 1))}
                                                    style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', padding: '4px 8px' }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{selectedQuantity}</span>
                                                <button 
                                                    onClick={() => setSelectedQuantity(q => q + 1)}
                                                    style={{ border: 'none', background: 'none', fontSize: '16px', fontWeight: '800', cursor: 'pointer', padding: '4px 8px' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button 
                                            onClick={() => handleAddToCart(activeModalProduct, selectedColor, selectedSize, selectedQuantity, true)}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                backgroundColor: '#6366F1', // Modern shop purple/blue
                                                color: '#FFF',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontWeight: '800',
                                                fontSize: '15px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Ajouter au panier
                                        </button>

                                        <button 
                                            onClick={() => handleBuyNow(activeModalProduct, selectedColor, selectedSize, selectedQuantity)}
                                            style={{
                                                width: '100%',
                                                padding: '16px',
                                                backgroundColor: '#0F172A',
                                                color: '#FFF',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontWeight: '800',
                                                fontSize: '15px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Acheter maintenant
                                        </button>

                                        {/* Description */}
                                        {activeModalProduct.description && (
                                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                                                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px 0' }}>Description</h3>
                                                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', margin: 0 }}>
                                                    {activeModalProduct.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            ) : (
                /* MAIN CATALOG GRID VIEW */
                <>
                    {/* Banner */}
                    <div style={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', padding: '28px 20px', marginBottom: '24px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0 }}>Paiement à la Livraison 🇩🇿</h2>
                        <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '8px' }}>Commandez en quelques clics et payez lors de la réception chez vous.</p>
                    </div>

                    {/* Search Bar & Categories */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type="text"
                                placeholder="🔍 Rechercher un produit..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')} 
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                            <button
                                onClick={() => { setSelectedCategorySlug('ALL'); setPage(1); }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    backgroundColor: selectedCategorySlug === 'ALL' ? '#10B981' : '#F1F5F9',
                                    color: selectedCategorySlug === 'ALL' ? '#FFF' : '#475569',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Tous les articles
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => { setSelectedCategorySlug(cat.slug); setPage(1); }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        backgroundColor: selectedCategorySlug === cat.slug ? '#10B981' : '#F1F5F9',
                                        color: selectedCategorySlug === cat.slug ? '#FFF' : '#475569',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '24px' }}>
                            {error}
                        </div>
                    )}

                    {/* Products Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: '#64748B', fontSize: '14px' }}>Chargement des produits...</div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#94A3B8' }}>
                            Aucun produit trouvé.
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                                {products.map((product) => {
                                    const productImage = product.images?.[0]?.url || product.imageUrl || (typeof product.images?.[0] === 'string' ? product.images[0] : null);

                                    return (
                                        <div 
                                            key={product._id} 
                                            onClick={() => handleOpenProduct(product)}
                                            style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s' }}
                                        >
                                            <div style={{ height: '200px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {productImage ? (
                                                    <img src={productImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Pas d'image</span>
                                                )}
                                            </div>

                                            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <div>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#10B981', textTransform: 'uppercase' }}>
                                                        {product.category?.name || 'STORE'}
                                                    </span>
                                                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '4px 0 8px 0' }}>{product.name}</h3>
                                                </div>

                                                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                                        {product.price} <span style={{ fontSize: '11px', color: '#64748B' }}>DZD</span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenProduct(product);
                                                        }}
                                                        style={{ padding: '10px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '20px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                                    >
                                                        Voir les détails
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: page === 1 ? '#F1F5F9' : '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '12px' }}
                                    >
                                        ◄ Précédent
                                    </button>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                        Page {page} sur {totalPages} ({totalProducts} produits)
                                    </span>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: page === totalPages ? '#F1F5F9' : '#FFF', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '12px' }}
                                    >
                                        Suivant ►
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Cart Drawer */}
            {isCartOpen && (
                <div onClick={() => setIsCartOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1100, display: 'flex', justifyContent: 'flex-end' }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFF', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.2)', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A' }}>Votre Panier ({cartCount})</h2>
                            <button onClick={() => setIsCartOpen(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: '800' }}>✕</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94A3B8', marginTop: '40px', fontSize: '14px' }}>Votre panier est vide.</div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.key} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid #F1F5F9', borderRadius: '8px', alignItems: 'center' }}>
                                        <img src={item.image || '/placeholder.png'} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{item.name}</div>
                                            {(item.color || item.size) && (
                                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                                    {item.color && `Couleur: ${item.color} `}
                                                    {item.size && `Taille: ${item.size}`}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>{item.price} DZD</div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #CBD5E1', borderRadius: '4px', padding: '2px 6px' }}>
                                            <button onClick={() => updateQuantity(item.key, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>-</button>
                                            <span style={{ fontSize: '12px', fontWeight: '700' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.key, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: '800' }}>+</button>
                                        </div>

                                        <button onClick={() => removeFromCart(item.key)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
                                    <span>Total:</span>
                                    <span>{cartTotal} DZD</span>
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
                                    style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}
                                    >
                                    Valider la Commande ({cartTotal} DZD)
                              </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}