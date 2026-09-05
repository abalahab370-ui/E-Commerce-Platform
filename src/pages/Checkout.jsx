import React, { useState, useEffect } from 'react';
import { getCart, clearCart } from '../utils/cart.js';
import { apiRequest } from '../utils/api.js';

// Wilaya rates map matching your backend configuration
const WILAYA_RATES = {
    "Adrar": { home: 1000, desk: 600 },
    "Chlef": { home: 700, desk: 400 },
    "Laghouat": { home: 800, desk: 500 },
    "Blida": { home: 600, desk: 350 },
    "Tizi Ouzou": { home: 650, desk: 350 },
    "Alger": { home: 500, desk: 300 },
    "Sétif": { home: 650, desk: 350 },
    "Oran": { home: 600, desk: 350 },
    "Constantine": { home: 650, desk: 350 },
    "Tamanrasset": { home: 1400, desk: 900 }
    // Extends across all 58 Wilayas
};

export default function Checkout() {
    const [cartItems, setCartItems] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        wilaya: 'Alger',
        baladiya: '',
        deliveryType: 'home'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Load local cart on mount
    useEffect(() => {
        setCartItems(getCart());
    }, []);

    // 1. Calculate Items Subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Calculate Dynamic Shipping Fee
    const selectedWilayaRates = WILAYA_RATES[formData.wilaya] || { home: 800, desk: 500 };
    const shippingCost = formData.deliveryType === 'desk' ? selectedWilayaRates.desk : selectedWilayaRates.home;

    // 3. Grand Total
    const grandTotal = subtotal + shippingCost;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        if (cartItems.length === 0) {
            setErrorMessage('Your cart is empty.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            shippingDetails: {
                fullName: formData.fullName,
                phone: formData.phone,
                wilaya: formData.wilaya,
                baladiya: formData.baladiya,
                deliveryType: formData.deliveryType
            },
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        try {
            // Send payload via our native fetch API wrapper
            const response = await apiRequest('/orders/guest', {
                method: 'POST',
                body: payload
            });

            clearCart();
            setCartItems([]);
            setOrderSuccess(response);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', border: '1px solid #10B981', borderRadius: '8px', backgroundColor: '#ECFDF5', textAlign: 'center' }}>
                <h2 style={{ color: '#065F46', marginBottom: '8px' }}>Order Placed Successfully!</h2>
                <p style={{ color: '#047857' }}>Order Reference ID: <strong>{orderSuccess.orderId}</strong></p>
                <p style={{ color: '#047857', marginTop: '12px' }}>We will call you at <strong>{formData.phone}</strong> shortly to confirm your delivery details.</p>
                <button 
                    onClick={() => window.location.href = '/'}
                    style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#059669', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Return to Catalog
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: '#1F2937' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '2px solid #E5E7EB', paddingBottom: '12px' }}>
                Checkout (Cash on Delivery)
            </h1>

            {errorMessage && (
                <div style={{ padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', borderRadius: '6px', marginBottom: '20px' }}>
                    {errorMessage}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
                
                {/* Left Column: Shipping Details Form */}
                <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Full Name *</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            required 
                            value={formData.fullName} 
                            onChange={handleInputChange} 
                            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                            placeholder="e.g. Karim Benali"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Phone Number *</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            required 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                            placeholder="0550 00 00 00"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Wilaya *</label>
                            <select 
                                name="wilaya" 
                                value={formData.wilaya} 
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px', backgroundColor: '#FFF' }}
                            >
                                {Object.keys(WILAYA_RATES).map(w => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Baladiya *</label>
                            <input 
                                type="text" 
                                name="baladiya" 
                                required 
                                value={formData.baladiya} 
                                onChange={handleInputChange} 
                                style={{ width: '100%', padding: '10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                                placeholder="e.g. Bab El Oued"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px' }}>Delivery Option *</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ flex: 1, padding: '12px', border: formData.deliveryType === 'home' ? '2px solid #2563EB' : '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="radio" 
                                    name="deliveryType" 
                                    value="home" 
                                    checked={formData.deliveryType === 'home'} 
                                    onChange={handleInputChange} 
                                />
                                Home Delivery
                            </label>
                            <label style={{ flex: 1, padding: '12px', border: formData.deliveryType === 'desk' ? '2px solid #2563EB' : '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="radio" 
                                    name="deliveryType" 
                                    value="desk" 
                                    checked={formData.deliveryType === 'desk'} 
                                    onChange={handleInputChange} 
                                />
                                Desk / Office Delivery
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || cartItems.length === 0}
                        style={{ marginTop: '12px', padding: '14px', backgroundColor: isSubmitting ? '#9CA3AF' : '#2563EB', color: '#FFF', fontWeight: 'bold', fontSize: '16px', border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                        {isSubmitting ? 'Processing Order...' : `Confirm Order (${grandTotal.toLocaleString()} DZD)`}
                    </button>
                </form>

                {/* Right Column: Order Summary */}
                <div style={{ backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #E5E7EB', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Order Summary</h3>
                    
                    {cartItems.length === 0 ? (
                        <p style={{ color: '#6B7280' }}>Your cart is currently empty.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cartItems.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span style={{ fontWeight: '600' }}>{(item.price * item.quantity).toLocaleString()} DZD</span>
                                </div>
                            ))}

                            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563' }}>
                                <span>Subtotal</span>
                                <span>{subtotal.toLocaleString()} DZD</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4B5563' }}>
                                <span>Delivery Fee ({formData.wilaya} - {formData.deliveryType})</span>
                                <span>{shippingCost.toLocaleString()} DZD</span>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                                <span>Total Bill</span>
                                <span>{grandTotal.toLocaleString()} DZD</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}