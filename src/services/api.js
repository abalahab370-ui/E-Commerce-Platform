const API_BASE_URL = 'http://localhost:5500/api/v2';

/**
 * Core wrapper around fetch to handle headers, credentials, and auto-refreshing expired tokens.
 */
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    // Default headers
    const headers = {
        ...(!options.isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        method: options.method || 'GET',
        headers,
        credentials: 'include', // Includes HTTP-only refresh token cookie
        ...(options.body && !options.isFormData && { body: JSON.stringify(options.body) }),
        ...(options.body && options.isFormData && { body: options.body }),
    };

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // 1. Handle Token Expiration (401) with automatic refresh attempt
        if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login')) {
            options._retry = true;
            const newToken = await refreshAccessToken();

            if (newToken) {
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${newToken}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
            } else {
                // Token refresh failed -> Clear stale auth and notify UI
                localStorage.removeItem('adminToken');
                window.dispatchEvent(new Event('auth:unauthorized'));
                throw new Error('Session expired. Please log in again.');
            }
        }

        // 2. Parse JSON only when the server actually returned JSON.
        const contentType = response.headers.get('content-type') || '';
        const responseText = await response.text();
        let data = {};

        if (responseText && contentType.includes('application/json')) {
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(`Invalid JSON response from ${endpoint}`);
            }
        } else if (responseText) {
            data = { message: responseText };
        }

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status} ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error(`[API Call Error] ${endpoint}:`, error.message);
        throw error;
    }
}

/**
 * Attempts token refresh using HTTP-only cookie endpoint (refreshControlles.js)
 */
async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (data.accessToken) {
            localStorage.setItem('adminToken', data.accessToken);
            return data.accessToken;
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================================================
// API ENDPOINT SERVICES
// ============================================================================

export const api = {
    // --- AUTHENTICATION ---
    login: (username, password) => 
        apiFetch('/auth/login', { method: 'POST', body: { username, password } }),

    register: (userData) => 
        apiFetch('/auth/register', { method: 'POST', body: userData }),

    logout: () => 
        apiFetch('/auth/logout', { method: 'POST' }),

    // --- CATEGORIES ---
    getCategories: () => 
        apiFetch('/categories'),

    createCategory: (categoryData) => 
        apiFetch('/categories', { method: 'POST', body: categoryData }),

    updateCategory: (id, categoryData) => 
        apiFetch(`/categories/${id}`, { method: 'PATCH', body: categoryData }),

    deleteCategory: (id) => 
        apiFetch(`/categories/${id}`, { method: 'DELETE' }),

    // --- PRODUCTS ---
    getProducts: (params = {}) => {
        // Removes empty, null, or undefined fields prior to serializing
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const queryString = new URLSearchParams(cleanParams).toString();
        return apiFetch(`/products${queryString ? `?${queryString}` : ''}`);
    },

    getProductById: (id) => 
        apiFetch(`/products/${id}`),

    // Standard Product Creation (POST /products)
    createStandardProduct: (formData) => 
        apiFetch('/products', { method: 'POST', body: formData, isFormData: true }),

    // Variant Product Creation (POST /products/variant)
    createVariantProduct: (formData) => 
        apiFetch('/products/variant', { method: 'POST', body: formData, isFormData: true }),

    // Single route handles both variant and standard updates (PATCH /products/:id)
    updateProduct: (id, formData) => 
        apiFetch(`/products/${id}`, { method: 'PATCH', body: formData, isFormData: true }),

    deleteProduct: (id) => 
        apiFetch(`/products/${id}`, { method: 'DELETE' }),

    // --- ORDERS (COD & CALL CENTER) ---
    createGuestOrder: (orderData) => 
        apiFetch('/orders', { method: 'POST', body: orderData }),

    getOrders: (status = 'Pending_Confirmation') => 
        apiFetch(`/orders?status=${status}`),

    updateOrderStatus: (orderId, status) => 
        apiFetch(`/orders/${orderId}/status`, { method: 'PATCH', body: { status } }),
};