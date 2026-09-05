import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { addToCart } from '../utils/cart.js';

export default function ProductDetail({ productId }) {
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (productId) fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await apiRequest(`/products/${productId}`);
            setProduct(data);
            if (data?.images?.length > 0) {
                setSelectedImage(data.images[0].url);
            }
        } catch (err) {
            setError(err.message || 'Product not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) return;

        addToCart(product, quantity);
        setNotification(`Added ${quantity}x "${product.name}" to cart`);
        setTimeout(() => setNotification(''), 2500);
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 20px', color: '#64748B', fontFamily: 'sans-serif' }}>
                Loading product details...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '20px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontFamily: 'sans-serif' }}>
                {error || 'Product not found.'}
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#0F172A' }}>
            
            {/* Notification Banner */}
            {notification && (
                <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0F172A', color: '#FFF', padding: '12px 20px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, fontWeight: '500' }}>
                    {notification}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
                
                {/* Left Column: Image Gallery */}
                <div>
                    {/* Main Active Image */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F8FAFC', marginBottom: '16px' }}>
                        <img 
                            src={selectedImage || 'https://via.placeholder.com/500?text=No+Image'} 
                            alt={product.name} 
                            style={{ width: '100%', height: '380px', objectFit: 'contain' }} 
                        />
                    </div>

                    {/* Thumbnail Switcher */}
                    {product.images?.length > 1 && (
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img.url)}
                                    style={{
                                        border: selectedImage === img.url ? '2px solid #2563EB' : '1px solid #CBD5E1',
                                        borderRadius: '6px',
                                        padding: '2px',
                                        backgroundColor: '#FFF',
                                        cursor: 'pointer',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <img 
                                        src={img.url} 
                                        alt="" 
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Product Metadata & Purchasing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</h1>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>
                            {product.price.toLocaleString()} DZD
                        </p>
                    </div>

                    {/* Stock Status Indicator */}
                    <div>
                        <span style={{ 
                            display: 'inline-block', 
                            padding: '4px 10px', 
                            borderRadius: '4px', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            backgroundColor: isOutOfStock ? '#FEE2E2' : '#DCFCE7', 
                            color: isOutOfStock ? '#991B1B' : '#166534' 
                        }}>
                            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units left)`}
                        </span>
                    </div>

                    {/* Description */}
                    <div style={{ borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '16px 0' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Description</h3>
                        <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#334155', whiteSpace: 'pre-line' }}>
                            {product.description || 'No description provided for this product.'}
                        </p>
                    </div>

                    {/* Quantity Picker & Add to Cart */}
                    {!isOutOfStock && (
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px' }}>
                                <button 
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    style={{ padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    -
                                </button>
                                <span style={{ padding: '0 12px', fontWeight: 'bold', fontSize: '16px' }}>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                                    style={{ padding: '10px 16px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#0F172A',
                                    color: '#FFF',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Add to Cart ({(product.price * quantity).toLocaleString()} DZD)
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}