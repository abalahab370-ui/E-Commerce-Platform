import React, { useState } from 'react';
import { apiRequest } from '../utils/api.js';

export default function AdminLogin({ onLoginSuccess }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: credentials
            });

            // Store JWT token for subsequent protected requests
            if (data.accessToken) {
                localStorage.setItem('adminToken', data.accessToken);
                if (onLoginSuccess) {
                    onLoginSuccess();
                }
            } else {
                throw new Error('Invalid server response. Missing token.');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '420px', margin: '80px auto', padding: '32px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFF', fontFamily: 'sans-serif', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>Admin Portal Login</h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', textAlign: 'center' }}>Access the order call-center management dashboard</p>

            {error && (
                <div style={{ padding: '10px 14px', backgroundColor: '#FEE2E2', border: '1px solid #EF4444', color: '#991B1B', borderRadius: '6px', fontSize: '14px', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Username / Email</label>
                    <input
                        type="text"
                        name="username"
                        required
                        value={credentials.username}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="admin"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
                    <input
                        type="password"
                        name="password"
                        required
                        value={credentials.password}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '14px' }}
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: loading ? '#94A3B8' : '#0F172A',
                        color: '#FFF',
                        fontWeight: '600',
                        fontSize: '15px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}