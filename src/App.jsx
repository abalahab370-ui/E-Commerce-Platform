import React, { useState, useEffect } from 'react';
import StoreNavbar from './components/StoreNavbar';
import AdminNavbar from './components/AdminNavbar';
import Catalog from './pages/Store/Catalog';
import Checkout from './pages/Store/Checkout';
import OrdersDashboard from './pages/admin/OrdersDashBoard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Login from './pages/admin/Login';

export default function App() {
    // Mode switcher: 'store' or 'admin'
    const [viewMode, setViewMode] = useState('store'); 
    
    // Auth state for Admin area
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));
    const [adminTab, setAdminTab] = useState('orders');

    // Customer store checkout selection
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        setIsAuthenticated(!!token);
    }, [viewMode]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setViewMode('store');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            {viewMode === 'store' ? (
                <>
                    <StoreNavbar 
                        onGoToAdmin={() => setViewMode('admin')} 
                        onResetStore={() => setSelectedProductId(null)} 
                    />
                    <main style={{ flex: 1 }}>
                        {selectedProductId ? (
                            <Checkout 
                                productId={selectedProductId} 
                                onBackToStore={() => setSelectedProductId(null)} 
                            />
                        ) : (
                            <Catalog 
                                onSelectProduct={(id) => setSelectedProductId(id)} 
                            />
                        )}
                    </main>
                </>
            ) : (
                <>
                    {isAuthenticated ? (
                        <>
                            <AdminNavbar 
                                activeTab={adminTab} 
                                setActiveTab={setAdminTab} 
                                onLogout={handleLogout} 
                                onGoToStore={() => setViewMode('store')} 
                            />
                            <main style={{ flex: 1 }}>
                                {adminTab === 'orders' && <OrdersDashboard />}
                                {adminTab === 'products' && <ProductManagement />}
                                {adminTab === 'categories' && <CategoryManagement />}
                            </main>
                        </>
                    ) : (
                        <div style={{ flex: 1 }}>
                            <div style={{ padding: '16px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => setViewMode('store')}
                                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
                                >
                                    ← Retour à la boutique
                                </button>
                            </div>
                            <Login onLoginSuccess={() => setIsAuthenticated(true)} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}