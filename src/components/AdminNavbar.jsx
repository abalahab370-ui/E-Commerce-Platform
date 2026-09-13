import React from 'react';

export default function AdminNavbar({ activeTab, setActiveTab, onLogout, onGoToStore }) {
    const tabs = [
        { id: 'orders', label: 'Commandes COD' },
        { id: 'products', label: 'Produits' },
        { id: 'categories', label: 'Catégories' },
    ];

    const handleLogoutClick = async () => {
        try {
            await fetch('/api/v2/auth/logout', {
                method: 'DELETE',
                credentials: 'include' // Ensures cookies are sent with the request
            });
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err);
        } finally {
            if (onLogout) onLogout();
        }
    };

    return (
        <header style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '0 24px' }}>
            <div style={{ maxWidth: '1360px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Admin Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>
                        STORE<span style={{ color: '#10B981' }}>DZ</span> <span style={{ fontSize: '11px', backgroundColor: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>ADMIN</span>
                    </span>

                    {/* Navigation Tabs */}
                    <nav style={{ display: 'flex', gap: '8px' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: activeTab === tab.id ? '#1E293B' : 'transparent',
                                    color: activeTab === tab.id ? '#10B981' : '#94A3B8',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Right Action Controls */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        onClick={onGoToStore}
                        style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Voir la boutique
                    </button>
                    <button
                        onClick={handleLogoutClick}
                        style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Déconnexion
                    </button>
                </div>

            </div>
        </header>
    );
}