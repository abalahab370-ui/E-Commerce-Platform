import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { addToCart } from '../utils/cart.js';

export default function Catalog() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addedNotification, setAddedNotification] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const data = await apiRequest('/categories');
            setCategories(data || []);
        } catch (err) {
            console.error('Failed to load categories:', err.message);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');

        try {
            let endpoint = '/products?';
            if (selectedCategory) endpoint += `category=${selectedCategory}&`;
            if (searchTerm.trim()) endpoint += `search=${encodeURIComponent(searchTerm.trim())}`;

            const data = await apiRequest(endpoint);
            setProducts(data.products || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch products.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedNotification(`Added "${product.name}" to cart`);
        setTimeout(() => setAddedNotification(''), 2500);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#0F172A' }}>
            
            {/* Notification Banner */}
            {addedNotification && (
                <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0F172A', color: '#FFF', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: '500' }}>
                    {addedNotification}
                </div>
            )}

            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>Store Catalog</h1>

                {/* Search & Category Filter */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFF' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '6px', width: '220px' }}
                        />
                        <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <p style={{ color: '#64748B' }}>Loading products...</p>
            ) : products.length === 0 ? (
                <p style={{ color: '#64748B' }}>No products found.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                    {products.map((product) => {
                        const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';
                        const isOutOfStock = product.stock <= 0;

                        return (
                            <div 
                                key={product._id} 
                                style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                <div>
                                    <img 
                                        src={mainImage} 
                                        alt={product.name} 
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                                    />
                                    <div style={{ padding: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
                                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', marginBottom: '12px' }}>
                                            {product.price.toLocaleString()} DZD
                                        </p>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: isOutOfStock ? '#DC2626' : '#16A34A' }}>
                                            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock})`}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ padding: '16px', paddingTop: '0' }}>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={isOutOfStock}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: isOutOfStock ? '#94A3B8' : '#0F172A',
                                            color: '#FFF',
                                            fontWeight: '600',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}