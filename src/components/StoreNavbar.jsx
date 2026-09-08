import React, { useState } from 'react';
export default function StoreNavbar({ onGoToAdmin, onResetStore, onGoToCheckout }) {
    const [isCartOpen, setIsCartOpen] = useState(false);

    const handleCheckout = () => {
        setIsCartOpen(false); // Close cart drawer
        if (onGoToCheckout) {
            onGoToCheckout(); // Switch view to Checkout
        }
    };

    return (
        <nav>
            {/* Navbar Header ... */}

            {/* CART DRAWER PANEL */}
            {isCartOpen && (
                <div className="cart-drawer">
                    {/* Cart Items List */}

                    <button 
                        type="button" 
                        onClick={handleCheckout}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#10B981',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Valider la Commande
                    </button>
                </div>
            )}
        </nav>
    );
}