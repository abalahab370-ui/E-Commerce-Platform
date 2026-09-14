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
                credentials: 'include'
            });
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err);
        } finally {
            if (onLogout) onLogout();
        }
    };

    return (
        <header style={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderBottom: '1px solid #1E293B', sticky: 'top', top: 0, zIndex: 50, width: '100%', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Brand Logo & Global Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.5px' }}>
                            STORE<span style={{ color: '#10B981' }}>DZ</span>
                        </span>
                        <span style={{ fontSize: '10px', backgroundColor: '#1E293B', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', border: '1px solid #334155' }}>
                            ADMIN
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            onClick={onGoToStore}
                            style={{ padding: '6px 12px', backgroundColor: '#1E293B', color: '#F1F5F9', border: '1px solid #334155', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Voir la boutique
                        </button>
                        <button
                            onClick={handleLogoutClick}
                            style={{ padding: '6px 12px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>

                {/* Mobile-Friendly Scrollable Tab Navigation Bar */}
                <nav style={{ display: 'flex', gap: '6px', backgroundColor: '#1E293B', padding: '4px', borderRadius: '8px', border: '1px solid #334155', overflowX: 'auto', width: '100%', boxSizing: 'border-box' }}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: '1 0 auto',
                                    padding: '8px 14px',
                                    backgroundColor: isActive ? '#0F172A' : 'transparent',
                                    color: isActive ? '#38BDF8' : '#94A3B8',
                                    border: isActive ? '1px solid #334155' : '1px solid transparent',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    textAlign: 'center'
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

            </div>
        </header>
    );
}