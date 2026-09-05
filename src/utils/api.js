// utils/api.js

const BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Universal Native Fetch Wrapper
 * @param {string} endpoint - e.g., '/products' or '/orders/guest'
 * @param {object} options - method, body, custom headers
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, token = null } = {}) {
    const headers = {};

    // If sending JSON (not FormData)
    if (body && !(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Attach JWT for Admin Routes if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : null
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error.message);
        throw error;
    }
}