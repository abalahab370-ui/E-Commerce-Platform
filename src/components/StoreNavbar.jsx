import React from 'react';

export default function StoreNavbar({ onGoToAdmin, onResetStore }) {
    return (
        <header style={{ backgroundColor: '#FFF', borderBottom: '1px solid #E2E8F0', padding: '0 20px', position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Brand Logo */}
                <div 
                    onClick={onResetStore} 
                    style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '1px', cursor: 'pointer', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    STORE<span style={{ color: '#10B981' }}>DZ</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: '12px', fontWeight: '700' }}>
                        COD 🇩🇿
                    </span>
                </div>

                {/* Admin Access Switcher */}
                <button
                    onClick={onGoToAdmin}
                    style={{ padding: '8px 14px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', fontWeight: '700', color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    🔒 Espace Admin
                </button>

            </div>
        </header>
    );
}