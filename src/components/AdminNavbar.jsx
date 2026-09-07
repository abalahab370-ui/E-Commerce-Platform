import React from 'react';

export default function AdminNavbar({ activeTab, setActiveTab, onLogout, onGoToStore }) {
    const tabs = [
        { id: 'orders', label: '📞 Commandes COD' },
        { id: 'products', label: '📦 Produits' },
        { id: 'categories', label: '🏷️ Catégories' },
    ];

    return (
        <header style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '0 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Admin Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>
                        STORE<span style={{ color: '#10B981' }}>DZ</span> <span style={{ fontSize: '11px', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>ADMIN</span>
                    </span>

                    {/* Navigation Tabs */}
                    <nav style={{ display: 'flex', gap: '4px' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 14px',
                                    backgroundColor: activeTab === tab.id ? '#1E293B' : 'transparent',
                                    color: activeTab === tab.id ? '#10B981' : '#94A3B8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={onGoToStore}
                        style={{ padding: '6px 12px', backgroundColor: '#334155', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        🌐 Voir la boutique
                    </button>
                    <button
                        onClick={onLogout}
                        style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                        Déconnexion
                    </button>
                </div>

            </div>
        </header>
    );
}