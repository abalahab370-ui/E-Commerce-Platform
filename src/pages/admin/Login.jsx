import React, { useState } from 'react';
import { api } from '../../services/api';

export default function Login({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.login(username, password);
            if (data.accessToken) {
                localStorage.setItem('adminToken', data.accessToken);
                onLoginSuccess();
            } else {
                throw new Error('Jeton d\'accès non reçu du serveur');
            }
        } catch (err) {
            setError(err.message || 'Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '16px' }}>
            <div style={{ width: '100%', maxWidth: '380px', backgroundColor: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>STORE<span style={{ color: '#10B981' }}>DZ</span> Admin</h1>
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>Espace sécurisé pour administrateurs</p>
                </div>

                {error && (
                    <div style={{ padding: '10px 12px', backgroundColor: '#FEE2E2', borderLeft: '3px solid #EF4444', color: '#991B1B', borderRadius: '4px', marginBottom: '16px', fontSize: '12px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                            Nom d'utilisateur
                        </label>
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="ex: admin"
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                            Mot de passe
                        </label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '10px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: '12px', backgroundColor: '#0F172A', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}