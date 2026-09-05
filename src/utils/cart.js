// utils/cart.js

const CART_KEY = 'ecom_guest_cart';

// Get current cart array
export function getCart() {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
}

// Add item to cart
export function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.productId === product._id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || '',
            quantity
        });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Clear cart after successful guest checkout
export function clearCart() {
    localStorage.removeItem(CART_KEY);
}