import React, { useState, useEffect } from 'react';
import { getCart } from '../utils/cart.js';

export default function Navbar({ currentView, setCurrentView }) {
    const [cartCount, setCartCount] = useState(0);

    // Sync cart item counter with localStorage
    useEffect(() => {
        const updateCount = () => {
            const cart = getCart();
            const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalQty);
        };

        updateCount();

        // Listen for custom cart events or storage changes
        window.addEventListener('storage', updateCount);
        const interval = setInterval(updateCount, 1000); // Polling backup for local changes

        return () => {
            window.removeEventListener('storage', updateCount);
            clearInterval(interval);
        };
    }, []);

    const navItemStyle = (viewName) => ({
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: currentView === viewName ? '#2563EB' : '#475569',
        backgroundColor: currentView === viewName ? '#EFF6FF' : 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    });

    return (
        <header style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFF', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Brand / Logo */}
                <button 
                    onClick={() => setCurrentView('catalog')} 
                    style={{ fontSize: '20px', fontWeight: 'bold', color: '#0F172A', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                >
                    STORE<span style={{ color: '#2563EB' }}>DZ</span>
                </button>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button onClick={() => setCurrentView('catalog')} style={navItemStyle('catalog')}>
                        Catalog
                    </button>

                    <button 
                        onClick={() => setCurrentView('checkout')} 
                        style={{ ...navItemStyle('checkout'), display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <span>Cart / Checkout</span>
                        {cartCount > 0 && (
                            <span style={{ backgroundColor: '#2563EB', color: '#FFF', fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <button 
                        onClick={() => setCurrentView('admin-login')} 
                        style={{ ...navItemStyle('admin-login'), color: '#64748B', borderLeft: '1px solid #E2E8F0', borderRadius: '0', paddingLeft: '20px' }}
                    >
                        Admin Area
                    </button>
                </nav>

            </div>
        </header>
    );
}