import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('storedz_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('storedz_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, selectedOptions = {}, quantity = 1) => {
        setCart(prev => {
            const productId = product._id || product.id;
            const variantId = selectedOptions.variantId || selectedOptions._id || null;
            const color = selectedOptions.color || null;
            const size = selectedOptions.size || null;

            // Composite key matching product + variant details
            const itemKey = `${productId}-${variantId || ''}-${color || ''}-${size || ''}`;
            const existingIndex = prev.findIndex(item => item.key === itemKey);

            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                return updated;
            }

            return [...prev, {
                key: itemKey,
                productId,
                _id: productId, // Fallback compatibility
                variantId,
                name: product.name,
                price: product.price,
                image: product.images?.[0]?.url || product.imageUrl || '',
                color,
                size,
                quantity
            }];
        });
    };

    const removeFromCart = (itemKey) => {
        setCart(prev => prev.filter(item => item.key !== itemKey));
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

    const clearCart = () => setCart([]);

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalAmount,
            totalItems,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);