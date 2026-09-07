import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function Catalog({ onSelectProduct }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStoreData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.getProducts(),
                api.getCategories()
            ]);
            setProducts(Array.isArray(productsRes) ? productsRes : productsRes.products || []);
            setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.categories || []);
        } catch (err) {
            setError('Impossible de charger les produits. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStoreData();
    }, [loadStoreData]);

    const filteredProducts = selectedCategory === 'ALL' 
        ? products 
        : products.filter(p => (p.category?._id || p.category) === selectedCategory);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>
            
            {/* Hero Banner */}
            <div style={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', padding: '32px 24px', marginBottom: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>Paiement à la Livraison 🇩🇿</h1>
                <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '8px' }}>Commandez en quelques clics et payez lors de la réception chez vous.</p>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                    onClick={() => setSelectedCategory('ALL')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        backgroundColor: selectedCategory === 'ALL' ? '#10B981' : '#F1F5F9',
                        color: selectedCategory === 'ALL' ? '#FFF' : '#475569',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Tous les articles
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            backgroundColor: selectedCategory === cat._id ? '#10B981' : '#F1F5F9',
                            color: selectedCategory === cat._id ? '#FFF' : '#475569',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '13px', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748B', fontSize: '14px' }}>Chargement de la boutique...</div>
            ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', color: '#94A3B8' }}>
                    Aucun produit disponible dans cette catégorie.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    {filteredProducts.map((product) => {
                        // Safely resolve the image URL from Cloudinary array or direct URL
                        const productImage = product.images?.[0]?.url || product.imageUrl;

                        return (
                            <div 
                                key={product._id} 
                                style={{ backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                <div style={{ height: '180px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
                                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {product.description}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                                            {product.price} <span style={{ fontSize: '11px', color: '#64748B' }}>DZD</span>
                                        </span>
                                        <button
                                            onClick={() => onSelectProduct(product._id)}
                                            style={{ padding: '8px 14px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Commander
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}